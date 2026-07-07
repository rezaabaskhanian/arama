package exerciseservice

import (
	domain "aramina/internal/domain/exercise"
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/exercise/dto"
	"context"
)

// ایجاد تمرین

func (s Service) CreateExercise(ctx context.Context, req dto.CreateExerciseRequest) (dto.CreateExerciseResponse, error) {
	const op = "exerciseservice.CreateExercise"

	ex, err := domain.NewExercise(req.Title, req.Description, req.TraumaType, req.MediaURL, req.Duration, req.Order)

	if err != nil {
		return dto.CreateExerciseResponse{}, richerror.New(op).WithErr(err).WithMessage("مشکل در ساخت ورزش جدید")
	}

	created, err := s.repo.SaveExercise(ctx, ex)

	return dto.CreateExerciseResponse{
		ExerciseInfo: dto.ExerciseInfo{
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

// GetExercisesByTraumaType گرفتن تمرین‌های مناسب برای یک نوع تروما (با وضعیت انجام/انجام نشده)
// func (s Service) GetExercisesByTraumaType(
//     ctx context.Context,
//     userID string,
//     traumaType assessmentvalueobject.TraumaType,
// ) ([]dto.ExerciseResponse, error) {
//     // گرفتن همه تمرین‌های فعال برای این نوع تروما
//     exercises, err := s.repo.FindExercisesByTraumaType(ctx, traumaType)
//     if err != nil {
//         return nil, err
//     }

//     userValueID := uservalueobject.UserID(userID)
//     responses := make([]*dto.ExerciseResponse, 0, len(exercises))

//     for _, ex := range exercises {
//         // بررسی آیا کاربر این تمرین را انجام داده است
//         isCompleted, _ := s.repo.IsExerciseCompletedByUser(ctx, userValueID, ex.ID)

//         // پیدا کردن زمان انجام (اگر انجام داده)
//         var completedAt *string
//         if isCompleted {
//             userExercise, _ := s.repo.FindUserExercise(ctx, userValueID, ex.ID)
//             if userExercise != nil {
//                 completedAtStr := userExercise.CompletedAt.Format("2006-01-02T15:04:05Z07:00")
//                 completedAt = &completedAtStr
//             }
//         }

//         responses = append(responses, &dto.ExerciseResponse{
//             ID:          ex.ID,
//             Title:       ex.Title,
//             Description: ex.Description,
//             TraumaType:  string(ex.TraumaType),
//             MediaURL:    ex.MediaURL,
//             Duration:    ex.Duration,
//             Order:       ex.Order,
//             IsCompleted: isCompleted,
//             CompletedAt: completedAt,
//         })
//     }

//     return responses, nil
// }

// // ========== متدهای مربوط به Exercise (مدیریتی - برای ادمین) ==========

// // CreateExercise ایجاد تمرین جدید
// func (s *Service) CreateExercise(ctx context.Context, req *dto.CreateExerciseRequest) (*exercise.Exercise, error) {
//     ex, err := exercise.NewExercise(
//         req.Title,
//         req.Description,
//         req.TraumaType,
//         req.MediaURL,
//         req.Duration,
//         req.Order,
//     )
//     if err != nil {
//         return nil, err
//     }

//     if err := s.repo.SaveExercise(ctx, ex); err != nil {
//         return nil, err
//     }

//     return ex, nil
// }

// // UpdateExercise به‌روزرسانی تمرین
// func (s *Service) UpdateExercise(ctx context.Context, req *dto.UpdateExerciseRequest) error {
//     ex, err := s.repo.FindExerciseByID(ctx, req.ID)
//     if err != nil {
//         return exercise.ErrExerciseNotFound
//     }

//     if err := ex.UpdateExercise(
//         req.Title,
//         req.Description,
//         req.MediaURL,
//         req.Duration,
//         req.Order,
//         req.IsActive,
//     ); err != nil {
//         return err
//     }

//     return s.repo.UpdateExercise(ctx, ex)
// }

// // DeleteExercise حذف تمرین
// func (s *Service) DeleteExercise(ctx context.Context, id uuid.UUID) error {
//     return s.repo.DeleteExercise(ctx, id)
// }

// // GetExerciseByID گرفتن تمرین با ID
// func (s *Service) GetExerciseByID(ctx context.Context, id uuid.UUID) (*exercise.Exercise, error) {
//     return s.repo.FindExerciseByID(ctx, id)
// }

// // GetAllExercises گرفتن همه تمرین‌ها
// func (s *Service) GetAllExercises(ctx context.Context, isActive *bool) ([]*exercise.Exercise, error) {
//     return s.repo.FindAllExercises(ctx, isActive)
// }

// // ========== متدهای مربوط به کاربر (User Exercises) ==========

// // GetExercisesByTraumaType گرفتن تمرین‌های مناسب برای یک نوع تروما (با وضعیت انجام/انجام نشده)
// func (s *Service) GetExercisesByTraumaType(
//     ctx context.Context,
//     userID uuid.UUID,
//     traumaType assessmentvalueobject.TraumaType,
// ) ([]*dto.ExerciseResponse, error) {
//     // گرفتن همه تمرین‌های فعال برای این نوع تروما
//     exercises, err := s.repo.FindExercisesByTraumaType(ctx, traumaType)
//     if err != nil {
//         return nil, err
//     }

//     userValueID := uservalueobject.UserID(userID)
//     responses := make([]*dto.ExerciseResponse, 0, len(exercises))

//     for _, ex := range exercises {
//         // بررسی آیا کاربر این تمرین را انجام داده است
//         isCompleted, _ := s.repo.IsExerciseCompletedByUser(ctx, userValueID, ex.ID)

//         // پیدا کردن زمان انجام (اگر انجام داده)
//         var completedAt *string
//         if isCompleted {
//             userExercise, _ := s.repo.FindUserExercise(ctx, userValueID, ex.ID)
//             if userExercise != nil {
//                 completedAtStr := userExercise.CompletedAt.Format("2006-01-02T15:04:05Z07:00")
//                 completedAt = &completedAtStr
//             }
//         }

//         responses = append(responses, &dto.ExerciseResponse{
//             ID:          ex.ID,
//             Title:       ex.Title,
//             Description: ex.Description,
//             TraumaType:  string(ex.TraumaType),
//             MediaURL:    ex.MediaURL,
//             Duration:    ex.Duration,
//             Order:       ex.Order,
//             IsCompleted: isCompleted,
//             CompletedAt: completedAt,
//         })
//     }

//     return responses, nil
// }

// // CompleteExercise ثبت انجام تمرین توسط کاربر
// func (s *Service) CompleteExercise(ctx context.Context, req *dto.CompleteExerciseRequest) error {
//     userID := uservalueobject.UserID(req.UserID)
//     exerciseID := req.ExerciseID

//     // بررسی وجود تمرین
//     ex, err := s.repo.FindExerciseByID(ctx, exerciseID)
//     if err != nil {
//         return exercise.ErrExerciseNotFound
//     }
//     if ex == nil {
//         return exercise.ErrExerciseNotFound
//     }

//     // بررسی اینکه کاربر قبلاً این تمرین را انجام نداده باشد
//     isCompleted, err := s.repo.IsExerciseCompletedByUser(ctx, userID, exerciseID)
//     if err != nil {
//         return err
//     }
//     if isCompleted {
//         return exercise.ErrAlreadyCompleted
//     }

//     // ثبت انجام تمرین
//     userExercise := exercise.NewUserExercise(userID, exerciseID)
//     return s.repo.SaveUserExercise(ctx, &userExercise)
// }

// // GetUserProgress گرفتن پیشرفت کاربر
// func (s *Service) GetUserProgress(ctx context.Context, userID uuid.UUID) (*dto.UserProgressResponse, error) {
//     userValueID := uservalueobject.UserID(userID)

//     // تعداد کل تمرین‌های فعال
//     isActive := true
//     allExercises, err := s.repo.FindAllExercises(ctx, &isActive)
//     if err != nil {
//         return nil, err
//     }
//     total := len(allExercises)

//     if total == 0 {
//         return &dto.UserProgressResponse{
//             TotalExercises:     0,
//             CompletedExercises: 0,
//             ProgressPercent:    0,
//         }, nil
//     }

//     // تعداد تمرین‌های انجام شده توسط کاربر
//     completed, err := s.repo.CountUserCompletedExercises(ctx, userValueID)
//     if err != nil {
//         return nil, err
//     }

//     progressPercent := (float64(completed) / float64(total)) * 100

//     return &dto.UserProgressResponse{
//         TotalExercises:     total,
//         CompletedExercises: completed,
//         ProgressPercent:    progressPercent,
//     }, nil
// }

// // RateExercise امتیاز دادن به تمرین انجام شده
// func (s *Service) RateExercise(ctx context.Context, req *dto.RateExerciseRequest) error {
//     userID := uservalueobject.UserID(req.UserID)
//     exerciseID := req.ExerciseID

//     // پیدا کردن رکورد انجام تمرین
//     userExercise, err := s.repo.FindUserExercise(ctx, userID, exerciseID)
//     if err != nil {
//         return exercise.ErrExerciseNotFound
//     }
//     if userExercise == nil {
//         return errors.New("شما این تمرین را انجام نداده‌اید")
//     }

//     // اضافه کردن امتیاز
//     return userExercise.AddRating(req.Rating)
// }

// // GetCompletedExercises گرفتن لیست تمرین‌های انجام شده توسط کاربر
// func (s *Service) GetCompletedExercises(ctx context.Context, userID uuid.UUID) ([]*exercise.UserExercise, error) {
//     userValueID := uservalueobject.UserID(userID)
//     return s.repo.FindUserCompletedExercises(ctx, userValueID)
// }
