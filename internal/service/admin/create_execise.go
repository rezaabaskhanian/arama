package adminservice

import (
	"aramina/internal/pkg/richerror"
	dtoExercise "aramina/internal/service/exercise/dto"
	"context"

	domainExercise "aramina/internal/domain/exercise"
)

// // CreateExercise ایجاد تمرین جدید (توسط ادمین)
// func (s Service) CreateExercise(ctx context.Context, req dto.CreateExerciseRequest) (*dto.ExerciseInfo, error) {
// 	// این منطق را می‌توانی از exercise service استفاده کنی
// 	// یا مستقیم اینجا پیاده‌سازی کنی
// }

func (s Service) CreateExercise(ctx context.Context, req dtoExercise.CreateExerciseRequest) (dtoExercise.CreateExerciseResponse, error) {
	const op = "exerciseservice.CreateExercise"

	ex, err := domainExercise.NewExercise(req.Title, req.Description, req.TraumaType, req.MediaURL, req.Duration, req.Order)

	if err != nil {
		return dtoExercise.CreateExerciseResponse{}, richerror.New(op).WithErr(err).WithMessage("مشکل در ساخت ورزش جدید")
	}

	created, err := s.exerciseRepo.SaveExercise(ctx, ex)

	return dtoExercise.CreateExerciseResponse{
		ExerciseInfo: dtoExercise.ExerciseInfo{
			ID:         string(created.ID),
			Title:      created.Title,
			TraumaType: string(created.TraumaType),
			MediaURL:   created.MediaURL,
			Duration:   created.Duration,
			Order:      created.Order,
			IsActive:   created.IsActive,
			CreatedAt:  created.CreatedAt,
			UpdatedAt:  created.UpdatedAt,
		},
	}, nil
}
