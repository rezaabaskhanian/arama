package adminservice

import (
	assessmentvalueobject "aramina/internal/domain/assessment/valueobject"
	domain "aramina/internal/domain/exercise"
	dtoExercises "aramina/internal/service/exercise/dto"
	"context"
)

// CreateExercise ایجاد تمرین جدید
func (s Service) CreateExerciseAdmin(ctx context.Context, req dtoExercises.CreateExerciseRequest) (*dtoExercises.ExerciseInfo, error) {
	exercise, err := domain.NewExercise(
		req.Title,
		req.Description,
		assessmentvalueobject.TraumaType(req.TraumaType),
		"",
		req.Duration,
		req.Order,
	)
	if err != nil {
		return nil, err
	}

	created, err := s.exerciseRepo.SaveExercise(ctx, exercise)
	if err != nil {
		return nil, err
	}

	return &dtoExercises.ExerciseInfo{
		ID:         string(created.ID),
		Title:      created.Title,
		TraumaType: string(created.TraumaType),
		MediaURL:   created.MediaURL,
		Duration:   created.Duration,
		Order:      created.Order,
		IsActive:   created.IsActive,
		CreatedAt:  created.CreatedAt,
		UpdatedAt:  created.UpdatedAt,
	}, nil
}
