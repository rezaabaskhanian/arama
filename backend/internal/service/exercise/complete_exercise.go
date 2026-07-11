package exerciseservice

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/exercise/dto"
	"context"
)

func (s Service) CompletedExercises(ctx context.Context, req dto.CompleteExrciseRequest) (dto.CompleteExrciseResonse, error) {

	const op = "exerciseservice.CompletedExercises"

	// لیست مرتب‌شده‌ی تمرین‌های این سطح و مجموعه‌ی تکمیل‌شده‌های کاربر را می‌گیریم
	// تا قوانین «ترتیبی» و «روزی یک تمرین» را اعمال کنیم.
	ordered, err := s.repo.FindExercisesByTraumaType(ctx, req.TraumaType)
	if err != nil {
		return dto.CompleteExrciseResonse{}, richerror.New(op).WithErr(err)
	}

	completedSet, err := s.repo.FindCompletedExerciseIDsByUser(ctx, req.UserID)
	if err != nil {
		return dto.CompleteExrciseResonse{}, richerror.New(op).WithErr(err)
	}

	if completedSet[req.ExerciseID] {
		return dto.CompleteExrciseResonse{}, richerror.New(op).WithMessage("این تمرین قبلاً تکمیل شده است")
	}

	// باید همان تمرینِ بعدی در نوبت باشد (ترتیبی)
	next := nextUnlockIndex(ordered, completedSet)
	if next < 0 || string(ordered[next].ID) != req.ExerciseID {
		return dto.CompleteExrciseResonse{}, richerror.New(op).WithMessage("ابتدا باید تمرین‌های قبلی را کامل کنی")
	}

	// روزی یک تمرین: اگر امروز تمرینی انجام داده، تا فردا قفل است
	lastDate, err := s.repo.GetLastUserExerciseDate(ctx, req.UserID)
	if err != nil {
		return dto.CompleteExrciseResonse{}, richerror.New(op).WithErr(err)
	}
	if lastDate != nil && isTodayTehran(*lastDate) {
		return dto.CompleteExrciseResonse{}, richerror.New(op).WithMessage("تمرین امروزت را انجام دادی 🌱 فردا برای تمرین بعدی برگرد")
	}

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
