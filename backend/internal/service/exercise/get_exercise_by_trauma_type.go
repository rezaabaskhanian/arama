package exerciseservice

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/exercise/dto"
	"context"
)

func (s Service) GetExercisByTraumaType(ctx context.Context, req dto.GetByTraumaTypeRequest) ([]dto.GetByTraumaTypeResponse, error) {

	const op = "GetExercisByTraumaType.exerciseservice"

	// اگر از نوع TraumaType است، به string تبدیل کن
	traumaTypeStr := string(req.TraumaType)

	res, err := s.repo.FindExercisesByTraumaType(ctx, traumaTypeStr)

	if err != nil {
		return []dto.GetByTraumaTypeResponse{}, richerror.New(op).WithErr(err).WithMessage("مشکل در ساخت ورزش جدید")
	}

	// اگر کاربر لاگین کرده باشد، وضعیت تکمیل و قفل هر تمرین را محاسبه می‌کنیم.
	var completed map[string]bool
	completedToday := false
	if req.UserID != "" {
		completed, err = s.repo.FindCompletedExerciseIDsByUser(ctx, req.UserID)
		if err != nil {
			return []dto.GetByTraumaTypeResponse{}, richerror.New(op).WithErr(err)
		}

		lastDate, err := s.repo.GetLastUserExerciseDate(ctx, req.UserID)
		if err != nil {
			return []dto.GetByTraumaTypeResponse{}, richerror.New(op).WithErr(err)
		}
		completedToday = lastDate != nil && isTodayTehran(*lastDate)
	}

	// اندیس تمرینِ بعدی در نوبت (اولین تکمیل‌نشده). فقط همین یکی «باز» است،
	// آن هم به شرطی که کاربر امروز تمرینی انجام نداده باشد.
	next := nextUnlockIndex(res, completed)

	result := make([]dto.GetByTraumaTypeResponse, 0, len(res))

	for i, ex := range res {
		isCompleted := completed[string(ex.ID)]

		// قفل است اگر تکمیل نشده و یا نوبتش نیست یا امروز تمرین انجام شده.
		// برای مهمان (بدون userID) هیچ چیزی قفل نمی‌شود.
		isLocked := false
		if req.UserID != "" && !isCompleted {
			isLocked = i != next || completedToday
		}

		result = append(result, dto.GetByTraumaTypeResponse{
			ExerciseInfo: dto.ExerciseInfo{
				ID:          string(ex.ID),
				Title:       ex.Title,
				Description: ex.Description,
				TraumaType:  string(ex.TraumaType),
				MediaURL:    ex.MediaURL,
				Duration:    ex.Duration,
				Order:       ex.Order,
				IsActive:    ex.IsActive,
				IsCompleted: isCompleted,
				IsLocked:    isLocked,
			},
		})
	}

	return result, nil
}
