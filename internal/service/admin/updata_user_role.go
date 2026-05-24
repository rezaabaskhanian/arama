package adminservice

import (
	"aramina/internal/service/admin/dto"
	"context"
)

// UpdateUserRole تغییر نقش کاربر
func (s Service) UpdateUserRole(ctx context.Context, userID, role string) error {
	return s.userRepo.UdateRole(ctx, userID, role)
}

// GetAllExercises گرفتن همه تمرین‌ها (برای مدیریت)
func (s Service) GetAllExercises(ctx context.Context, limit, offset int) ([]dto.ExerciseInfo, error) {
	exercises, err := s.exerciseRepo.FindAll(ctx, nil) // nil = همه
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
			IsActive:    ex.IsActive,
			CreatedAt:   ex.CreatedAt,
		}
	}

	return result, nil
}
