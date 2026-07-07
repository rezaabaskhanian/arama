package journalservice

import (
	domain "aramina/internal/domain/journal"
	journalvalueobject "aramina/internal/domain/journal/valueobject"
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/journal/dto"
	"context"
	"time"
)

func (s Service) UpdateJournalEntry(ctx context.Context, req dto.JournalUpdateRequest, userID string) error {

	const op = "journalservice.UpdateJournalEntry"

	res, err := s.repo.FindByID(ctx, req.JournalID, userID)

	if err != nil {

		return richerror.New(op).WithErr(err).WithMessage("مشکل در پیدا کردن یادداشت")
	}

	result := domain.Journal{
		ID:        res.ID,
		UserID:    res.UserID,
		Content:   req.Content,
		Mood:      journalvalueobject.MoodType(req.Mood),
		CreatedAt: res.CreatedAt,
		UpdatedAt: time.Now(),
	}

	err = s.repo.Update(ctx, result)
	if err != nil {

		return richerror.New(op).WithErr(err).WithMessage("خطا در به‌روزرسانی یادداشت")
	}

	return nil
}
