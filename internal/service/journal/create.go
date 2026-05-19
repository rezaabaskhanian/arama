package journalservice

import (
	domain "aramina/internal/domain/journal"
	journalvalueobject "aramina/internal/domain/journal/valueobject"
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/journal/dto"
	"context"
)

func (s Service) CreateJournal(ctx context.Context, req dto.JournalCreateRequest, userID string) (dto.JournalCreateResponse, error) {

	const op = "journalservice.CreateJournal"

	user, err := s.auth.GetUserByIDService(userID)

	if err != nil {
		return dto.JournalCreateResponse{}, richerror.New(op).WithErr(err).WithMessage("چنین یوزری موجود نیست")
	}

	todayCount, err := s.repo.CountTodayEntries(ctx, userID)
	if err != nil {
		return dto.JournalCreateResponse{}, richerror.New(op).WithErr(err).WithMessage("چنین یوزری موجود نیست")
	}

	NewJournal, err := domain.NewJournal(user.ID, req.Content, journalvalueobject.MoodType(req.Mood), todayCount)

	if err != nil {
		return dto.JournalCreateResponse{}, richerror.New(op).WithErr(err).WithMessage("مشکل در ایجاد ‌ژورنال جدید")
	}

	created, err := s.repo.Save(ctx, *NewJournal)

	return dto.JournalCreateResponse{JournalInfo: dto.JournalInfo{
		ID:        string(created.ID),
		UserID:    string(created.UserID),
		Content:   created.Content,
		Mood:      int(created.Mood),
		CreatedAt: created.CreatedAt,
		UpdatedAt: created.UpdatedAt,
	}}, nil

}
