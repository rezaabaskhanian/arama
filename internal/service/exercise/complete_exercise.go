package exerciseservice

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/exercise/dto"
	"context"
)

func (s Service) CompletedExercises(ctx context.Context, req dto.CompleteExrciseRequest) (dto.CompleteExrciseResonse, error) {

	const op = "exerciseservice.CompletedExercises"

	isComplete, err := s.repo.IsExerciseCompletedByUser(ctx, req.UserID, req.ExerciseID)

	if err != nil {
		return dto.CompleteExrciseResonse{}, richerror.New(op).WithErr(err)
	}

	if isComplete {
		return dto.CompleteExrciseResonse{}, richerror.New(op).WithMessage("این تمرین ثبلا تکمیل شده است")
	}

	// userExercise := domain.NewUserExercise(req.UserID, req.ExerciseID)

	err = s.repo.SaveUserExercise(ctx, req.UserID, req.ExerciseID)
	if err != nil {
		return dto.CompleteExrciseResonse{}, richerror.New(op).WithErr(err).WithMessage("مشکل در ثبت تمرین")
	}

	totalExercises, err := s.repo.CountTotalExercies(ctx, req.TraumaType)

	if err != nil {
		return dto.CompleteExrciseResonse{}, richerror.New(op).WithErr(err)
	}

	completedExercises, err := s.repo.CountUserCompletedExercises(ctx, req.UserID)

	if err != nil {
		return dto.CompleteExrciseResonse{}, richerror.New(op).WithErr(err)
	}

	ProgressPercent := 0

	if totalExercises > 0 {
		ProgressPercent = int((float64(completedExercises) / float64(totalExercises)) * 100)
	}

	return dto.CompleteExrciseResonse{
		TotalExercises:     totalExercises,
		CompletedExercises: completedExercises,
		ProgressPercent:    ProgressPercent,
	}, nil

}
