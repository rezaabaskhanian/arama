package exerciseservice

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/exercise/dto"
	"context"
)

func (s Service) GetUserProgress(ctx context.Context, req dto.GetUserProgressRequest) (dto.GetUserProgressResponse, error) {
	const op = "exerciseservice.GetUserProgress"

	totalExercises, err := s.repo.CountTotalExercies(ctx, req.TraumaType)

	if err != nil {
		return dto.GetUserProgressResponse{}, richerror.New(op).WithErr(err).WithMessage("خطا در دریافت تعداد کل تمرین‌ها")
	}

	completedExercises, err := s.repo.CountUserCompletedExercises(ctx, req.UserID)

	if err != nil {
		return dto.GetUserProgressResponse{}, richerror.New(op).WithErr(err).WithMessage("خطا در دریافت تعداد تمرین‌های انجام شده")
	}

	ProgressPercent := 0

	if totalExercises > 0 {

		ProgressPercent = int((float64(completedExercises) / float64(totalExercises)) * 100)

	}

	return dto.GetUserProgressResponse{
		TotalExercises:     totalExercises,
		CompletedExercises: completedExercises,
		ProgressPercent:    ProgressPercent,
	}, nil

}
