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

	// وضعیت روزانه: آیا امروز تمرینی انجام شده و آیا تمرینِ بازی برای انجام هست.
	ordered, err := s.repo.FindExercisesByTraumaType(ctx, req.TraumaType)
	if err != nil {
		return dto.GetUserProgressResponse{}, richerror.New(op).WithErr(err)
	}

	completedSet, err := s.repo.FindCompletedExerciseIDsByUser(ctx, req.UserID)
	if err != nil {
		return dto.GetUserProgressResponse{}, richerror.New(op).WithErr(err)
	}

	lastDate, err := s.repo.GetLastUserExerciseDate(ctx, req.UserID)
	if err != nil {
		return dto.GetUserProgressResponse{}, richerror.New(op).WithErr(err)
	}

	completedToday := lastDate != nil && isTodayTehran(*lastDate)
	hasNext := nextUnlockIndex(ordered, completedSet) >= 0
	canDoToday := hasNext && !completedToday

	nextAvailableDate := ""
	if completedToday && hasNext {
		nextAvailableDate = nextTehranDayStart().Format("2006-01-02")
	}

	return dto.GetUserProgressResponse{
		TotalExercises:     totalExercises,
		CompletedExercises: completedExercises,
		ProgressPercent:    ProgressPercent,
		CompletedToday:     completedToday,
		CanDoToday:         canDoToday,
		NextAvailableDate:  nextAvailableDate,
	}, nil

}
