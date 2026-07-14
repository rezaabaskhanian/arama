package deviceservice

import (
	"aramina/internal/pkg/logger"
	"aramina/internal/pkg/richerror"
	"context"
)

// RegisterToken توکن دستگاه کاربر را ثبت/به‌روزرسانی می‌کند
func (s Service) RegisterToken(ctx context.Context, userID, token, platform string) error {
	const op = "deviceservice.RegisterToken"

	if token == "" {
		return richerror.New(op).WithMessage("توکن دستگاه نمی‌تواند خالی باشد")
	}
	if platform == "" {
		platform = "android"
	}

	if err := s.repo.SaveToken(ctx, userID, token, platform); err != nil {
		return richerror.New(op).WithErr(err)
	}
	return nil
}

// NotifyUser یک نوتیف push به همه‌ی دستگاه‌های کاربر می‌فرستد. Best-effort است:
// هیچ خطایی برنمی‌گرداند (تا جریان اصلی را قطع نکند) و توکن‌های باطل را پاک می‌کند.
func (s Service) NotifyUser(ctx context.Context, userID, title, body string, data map[string]string) {
	if s.pusher == nil {
		return // FCM پیکربندی نشده
	}

	tokens, err := s.repo.TokensForUser(ctx, userID)
	if err != nil {
		logger.L().Error("device: load tokens failed", "error", err.Error(), "user", userID)
		return
	}
	if len(tokens) == 0 {
		return
	}

	invalid, err := s.pusher.Push(ctx, tokens, title, body, data)
	if err != nil {
		logger.L().Error("device: push failed", "error", err.Error(), "user", userID)
		return
	}

	if len(invalid) > 0 {
		if err := s.repo.DeleteTokens(ctx, invalid); err != nil {
			logger.L().Error("device: prune invalid tokens failed", "error", err.Error())
		}
	}
}
