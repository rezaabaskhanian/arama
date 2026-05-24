package journalservice

import (
	"aramina/internal/pkg/richerror"
	"context"
)

func (s Service) CountByUserID(ctx context.Context, userID string) (int, error) {

	const op = "journalservice.CountByUserID"

	res, err := s.repo.CountByUserID(ctx, userID)

	if err != nil {
		return 0, richerror.New(op).WithErr(err)
	}

	return res, nil
}
