package exerciseservice

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/exercise/dto"
	"context"
)

func (s Service) GetExerciseByID(ctx context.Context, req dto.GetByIDrequest) (dto.ExerciseInfo, error) {
	const op = "exerciseservice.GetExerciseByID"

	ex, err := s.repo.FindExerciseByID(ctx, req.ExerciseID)

	if err != nil {
		return dto.ExerciseInfo{}, richerror.New(op).WithErr(err).WithMessage("مشکل در ساخت ورزش جدید")
	}

	return dto.ExerciseInfo{
		ID:    string(ex.ID),
		Title: ex.Title,

		TraumaType: string(ex.TraumaType),
		MediaURL:   ex.MediaURL,
		Duration:   ex.Duration,
		Order:      ex.Order,
		IsActive:   ex.IsActive,
	}, nil
}
