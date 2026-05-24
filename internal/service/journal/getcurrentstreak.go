package journalservice

import (
	"aramina/internal/pkg/richerror"
	"context"
)

func (s Service) GetCurrentStreak(ctx context.Context, userID string) (int, error) {

	const op = "journalservice.GetCurrentStreak"

	res, err := s.repo.GetCurrentStreak(ctx, userID)

	if err != nil {
		return 0, richerror.New(op).WithErr(err)
	}

	return res, nil
}
