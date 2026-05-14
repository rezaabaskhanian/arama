package exerciseservice

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/exercise/dto"
	"context"
)

func (s Service) GetExercisByTraumaType(ctx context.Context, req dto.GetByTraumaTypeRequest) ([]dto.GetByTraumaTypeResponse, error) {

	const op = "GetExercisByTraumaType.exerciseservice"

	res, err := s.repo.FindExercisesByTraumaType(ctx, req.TraumaType)

	if err != nil {
		return []dto.GetByTraumaTypeResponse{}, richerror.New(op).WithErr(err).WithMessage("مشکل در ساخت ورزش جدید")
	}
	result := make([]dto.GetByTraumaTypeResponse, 0, len(res))

	for _, ex := range res {
		result = append(result, dto.GetByTraumaTypeResponse{
			ExerciseInfo: dto.ExerciseInfo{
				ID:    string(ex.ID),
				Title: ex.Title,

				TraumaType: string(ex.TraumaType),
				MediaURL:   ex.MediaURL,
				Duration:   ex.Duration,
				Order:      ex.Order,
				IsActive:   ex.IsActive,
			},
		})
	}

	return result, err
}
