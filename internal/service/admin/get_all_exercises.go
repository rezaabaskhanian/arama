package adminservice

import (
	"aramina/internal/service/admin/dto"
	"context"
)

// GetAllExercises گرفتن همه تمرین‌ها
func (s Service) GetAllExercises(ctx context.Context) ([]dto.ExerciseInfo, error) {
	exercises, err := s.exerciseRepo.FindAll(ctx, nil)
	if err != nil {
		return nil, err
	}

	result := make([]dto.ExerciseInfo, len(exercises))
	for i, ex := range exercises {
		result[i] = dto.ExerciseInfo{
			ID:          string(ex.ID),
			Title:       ex.Title,
			Description: ex.Description,
			TraumaType:  string(ex.TraumaType),
			Duration:    ex.Duration,
			Order:       ex.Order,
			IsActive:    ex.IsActive,
			CreatedAt:   ex.CreatedAt,
		}
	}
	return result, nil
}
