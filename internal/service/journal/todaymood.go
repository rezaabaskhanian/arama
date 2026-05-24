package journalservice

import (
	"aramina/internal/pkg/richerror"
	"context"
	"time"
)

func (s Service) TodayMood(ctx context.Context, userID string) (int, error) {

	const op = "journalservice"

	today := time.Now()

	startOfDay := time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, today.Location())

	endOfDay := time.Now().Add(24 * time.Hour)

	res, err := s.repo.GetMoodByDateRange(ctx, string(userID), startOfDay, endOfDay)

	if err != nil {
		return 0, richerror.New(op).WithErr(err).WithMessage("نمیتونم به دیتابیس وصل بشم")
	}

	return res, nil

}
