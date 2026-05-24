package crisisservice

import (
	domain "aramina/internal/domain/crisis"
	"aramina/internal/pkg/richerror"
	"context"
)

// GetActiveCrisis گرفتن بحران فعال کاربر (حل نشده)
func (s Service) GetActiveCrisis(ctx context.Context, userID string) (*domain.Crisis, error) {
	const op = "crisisservice.GetActiveCrisis"

	crisis, err := s.repo.FindActiveByUserID(ctx, userID)
	if err != nil {
		return nil, richerror.New(op).WithErr(err).WithMessage("خطا در دریافت بحران فعال")
	}

	return crisis, nil
}
