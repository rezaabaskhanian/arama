package crisisservice

import (
	crisisvalueobject "aramina/internal/domain/crisis/valueobject"
	"aramina/internal/pkg/richerror"
	"context"
)

// ResolveCrisis حل کردن بحران
func (s Service) ResolveCrisis(ctx context.Context, crisisID string, userID string) error {
	const op = "crisisservice.ResolveCrisis"

	// 1. پیدا کردن بحران
	crisis, err := s.repo.FindByID(ctx, crisisvalueobject.CrisisID(crisisID))
	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("بحران یافت نشد")
	}

	// 2. چک کردن دسترسی (این بحران مال این کاربر است؟)
	if string(crisis.UserID) != userID {
		return richerror.New(op).WithMessage("شما دسترسی به این بحران ندارید")
	}

	// 3. اگر قبلاً حل شده، خطا نده
	if crisis.Status == crisisvalueobject.StatusResolved {
		return nil // یا return errors.New("بحران قبلاً حل شده است")
	}

	// 4. حل کردن بحران
	if err := crisis.Resolve(); err != nil {
		return richerror.New(op).WithErr(err).WithMessage("خطا در حل بحران")
	}

	// 5. ذخیره در دیتابیس
	if err := s.repo.Update(ctx, crisis); err != nil {
		return richerror.New(op).WithErr(err).WithMessage("خطا در ذخیره بحران")
	}

	return nil
}
