package crisisservice

import (
	crisisvalueobject "aramina/internal/domain/crisis/valueobject"
	"aramina/internal/pkg/richerror"
	"context"
	"fmt"
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

	fmt.Printf("🔍 BEFORE Resolve - Status: %s, ResolvedAt: %v\n", crisis.Status, crisis.ResolvedAt)

	if err := crisis.Resolve(); err != nil {
		return err
	}

	fmt.Printf("🔍 AFTER Resolve - Status: %s, ResolvedAt: %v\n", crisis.Status, crisis.ResolvedAt)

	if err := s.repo.Update(ctx, crisis); err != nil {
		return err
	}

	// 5. ذخیره در دیتابیس
	updated, _ := s.repo.FindByID(ctx, crisisvalueobject.CrisisID(crisisID))
	fmt.Printf("🔍 AFTER Update from DB - Status: %s, ResolvedAt: %v\n", updated.Status, updated.ResolvedAt)

	return nil
}
