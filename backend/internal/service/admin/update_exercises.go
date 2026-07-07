package adminservice

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/admin/dto"
	"context"
)

// UpdateExercise ویرایش تمرین
func (s Service) UpdateExercise(ctx context.Context, req dto.UpdateExerciseRequest) error {

	const op = "adminservice.UpdateExercise"
	// 1. پیدا کردن تمرین
	exercise, err := s.exerciseRepo.FindExerciseByID(ctx, req.ID)
	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("تمرین یافت نشد")
	}

	// 2. به‌روزرسانی فیلدها
	if err := exercise.UpdateExercise(
		req.Title,
		req.Description,
		req.MediaURL,
		req.Duration,
		req.Order,
		req.IsActive,
	); err != nil {
		return richerror.New(op).WithErr(err).WithMessage("خطا در به‌روزرسانی تمرین")
	}

	// 3. ذخیره در دیتابیس
	if err := s.exerciseRepo.UpdateExercise(ctx, exercise); err != nil {
		return richerror.New(op).WithErr(err).WithMessage("خطا در ذخیره تمرین")
	}

	return nil
}
