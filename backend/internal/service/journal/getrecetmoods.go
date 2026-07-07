package journalservice

import (
	"aramina/internal/pkg/richerror"
	"context"
)

func (s Service) GetRecentMoods(ctx context.Context, userID string, days int) ([]int, error) {
	const op = "journalservice.GetRecentMoods"

	moods, err := s.repo.GetRecentMoods(ctx, userID, days)
	if err != nil {
		return []int{}, richerror.New(op).WithErr(err).WithMessage("خطا در دریافت مودهای اخیر")
	}

	return moods, nil
}
