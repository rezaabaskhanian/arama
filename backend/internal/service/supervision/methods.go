package supervisionservice

import (
	domain "aramina/internal/domain/supervision"
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/supervision/dto"
	"context"
)

func toMessageDTO(m domain.Message) dto.MessageDTO {
	// پیام از طرف خودِ کاربر است اگر فرستنده همان صاحب گفتگو باشد (و خودکار نباشد)
	fromUser := !m.IsAuto && m.SenderID != "" && m.SenderID == m.UserID

	senderName := m.SenderName
	if m.IsAuto || m.SenderID == "" {
		senderName = "سیستم آرامینا"
	}
	return dto.MessageDTO{
		ID:         m.ID,
		Body:       m.Body,
		SenderName: senderName,
		IsAuto:     m.IsAuto,
		FromUser:   fromUser,
		CreatedAt:  m.CreatedAt,
	}
}

// ToggleSupervision درخواست/لغو نظارت روانشناس توسط کاربر
func (s Service) ToggleSupervision(ctx context.Context, userID string, wants bool) error {
	const op = "supervisionservice.ToggleSupervision"
	if err := s.repo.SetWantsSupervision(ctx, userID, wants); err != nil {
		return richerror.New(op).WithErr(err)
	}
	return nil
}

// GetStatus وضعیت نظارت + پیام‌های کاربر
func (s Service) GetStatus(ctx context.Context, userID string) (dto.StatusResponse, error) {
	const op = "supervisionservice.GetStatus"

	wants, err := s.repo.GetWantsSupervision(ctx, userID)
	if err != nil {
		return dto.StatusResponse{}, richerror.New(op).WithErr(err)
	}

	msgs, err := s.repo.ListMessagesForUser(ctx, userID)
	if err != nil {
		return dto.StatusResponse{}, richerror.New(op).WithErr(err)
	}

	out := make([]dto.MessageDTO, 0, len(msgs))
	for _, m := range msgs {
		out = append(out, toMessageDTO(m))
	}

	return dto.StatusResponse{WantsSupervision: wants, Messages: out}, nil
}

// ListSupervised فهرست کاربرانِ درخواست‌کننده‌ی نظارت (پنل روانشناس)
func (s Service) ListSupervised(ctx context.Context) (dto.SupervisedListResponse, error) {
	const op = "supervisionservice.ListSupervised"

	users, err := s.repo.ListSupervisedUsers(ctx)
	if err != nil {
		return dto.SupervisedListResponse{}, richerror.New(op).WithErr(err)
	}

	out := make([]dto.SupervisedUserDTO, 0, len(users))
	for _, u := range users {
		out = append(out, dto.SupervisedUserDTO{
			UserID:        u.UserID,
			Nickname:      u.Nickname,
			Phone:         u.Phone,
			LatestMood:    u.LatestMood,
			LastMessageAt: u.LastMessageAt,
			MessageCount:  u.MessageCount,
		})
	}
	return dto.SupervisedListResponse{Users: out}, nil
}

// MessagesForUser پیام‌های یک کاربر برای نمایش در پنل روانشناس
func (s Service) MessagesForUser(ctx context.Context, userID string) (dto.MessagesResponse, error) {
	const op = "supervisionservice.MessagesForUser"

	msgs, err := s.repo.ListMessagesForUser(ctx, userID)
	if err != nil {
		return dto.MessagesResponse{}, richerror.New(op).WithErr(err)
	}
	out := make([]dto.MessageDTO, 0, len(msgs))
	for _, m := range msgs {
		out = append(out, toMessageDTO(m))
	}
	return dto.MessagesResponse{Messages: out}, nil
}

// SendMessage روانشناس/ادمین برای کاربر پیام می‌فرستد. urgent=true یعنی پیام فوری
// که push آن از کانال crisis (عبور از حالت سکوت) می‌رود.
func (s Service) SendMessage(ctx context.Context, senderID, userID, body string, urgent bool) error {
	const op = "supervisionservice.SendMessage"

	if len([]rune(body)) == 0 {
		return richerror.New(op).WithMessage("متن پیام نمی‌تواند خالی باشد")
	}

	// فقط برای کاربری که واقعاً درخواست نظارت داده پیام بفرست
	wants, err := s.repo.GetWantsSupervision(ctx, userID)
	if err != nil {
		return richerror.New(op).WithErr(err)
	}
	if !wants {
		return richerror.New(op).WithMessage("این کاربر درخواست نظارت روانشناس نداده است")
	}

	if err := s.repo.SaveMessage(ctx, userID, senderID, body, false); err != nil {
		return richerror.New(op).WithErr(err)
	}

	// نوتیف push (best-effort، غیرمسدودکننده). متن عمومی است تا محتوای حساس روی
	// صفحه‌ی قفل لو نرود؛ متن کامل داخل اپ دیده می‌شود.
	if s.notifier != nil {
		title := "پیام تازه از همراهت 💬"
		bodyText := "یک پیام جدید برایت آمده؛ برای خواندن، آرامینا را باز کن."
		msgType := "supervision_message"
		if urgent {
			title = "🚨 پیام فوری از همراهت"
			bodyText = "یک پیام فوری داری — لطفاً همین حالا آرامینا را باز کن."
			msgType = "crisis"
		}
		go s.notifier.NotifyUser(context.Background(), userID, title, bodyText,
			map[string]string{"type": msgType})
	}

	return nil
}

// SendUserMessage پیام خودِ کاربر برای روانشناس/همراهش را ثبت می‌کند (چت دوطرفه).
// فرستنده و صاحب گفتگو هر دو خودِ کاربر است تا در toMessageDTO به‌عنوان from_user شناخته شود.
func (s Service) SendUserMessage(ctx context.Context, userID, body string) error {
	const op = "supervisionservice.SendUserMessage"

	if len([]rune(body)) == 0 {
		return richerror.New(op).WithMessage("متن پیام نمی‌تواند خالی باشد")
	}

	// نوشتن پیام برای روانشناس یعنی درخواست همراهی؛ اگر خاموش بود روشنش کن تا در پنل دیده شود
	wants, err := s.repo.GetWantsSupervision(ctx, userID)
	if err != nil {
		return richerror.New(op).WithErr(err)
	}
	if !wants {
		if err := s.repo.SetWantsSupervision(ctx, userID, true); err != nil {
			return richerror.New(op).WithErr(err)
		}
	}

	if err := s.repo.SaveMessage(ctx, userID, userID, body, false); err != nil {
		return richerror.New(op).WithErr(err)
	}

	// به روانشناس‌ها/ادمین‌ها خبر بده که پیام تازه‌ای رسیده (best-effort)
	if s.notifier != nil {
		go func() {
			staffIDs, err := s.repo.ListStaffIDs(context.Background())
			if err != nil {
				return
			}
			for _, sid := range staffIDs {
				s.notifier.NotifyUser(context.Background(), sid,
					"پیام تازه از یک مراجع 💬",
					"یک مراجع برایت پیام گذاشته؛ برای خواندن پنل همراهی را باز کن.",
					map[string]string{"type": "supervision_inbound"})
			}
		}()
	}

	return nil
}
