package exerciseservice

import (
	"aramina/internal/pkg/richerror"
	"context"
	"time"
)

func (s Service) GetInactiveDays(ctx context.Context, userID string) (int, error) {
	const op = "exerciseservice.GetInactiveDays"

	lastDate, err := s.repo.GetLastUserExerciseDate(ctx, userID)
	if err != nil {
		return 999, richerror.New(op).WithErr(err).WithMessage("خطا در دریافت آخرین تمرین")
	}

	if lastDate == nil {
		return 999, nil // هیچ تمرینی انجام نداده
	}

	days := int(time.Since(*lastDate).Hours() / 24)
	return days, nil
}
