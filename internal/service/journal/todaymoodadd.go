package journalservice

import (
	"aramina/internal/pkg/richerror"
	"context"
)

func (s Service) UpsertTodayMood(ctx context.Context, userID string, mood int) error {
	const op = "journalservice.UpsertTodayMood"

	err := s.repo.UpsertTodayMood(ctx, userID, mood)

	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("خطا در ذخیره مود امروز")

	}

	return nil

}
