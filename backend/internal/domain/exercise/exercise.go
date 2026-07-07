package exercise

import (
	assessmentvalueobject "aramina/internal/domain/assessment/valueobject"
	exercisevalueobject "aramina/internal/domain/exercise/valueobject"
	uservalueobject "aramina/internal/domain/user/valueobject"
	"errors"
	"time"
)

// Exercise تمرین اصلی
type Exercise struct {
	ID          exercisevalueobject.ExerciseID
	Title       string
	Description string
	TraumaType  assessmentvalueobject.TraumaType // mild, moderate, severe, complex
	MediaURL    string                           // لینک فایل صوتی/تصویری (اختیاری)
	Duration    int                              // مدت زمان به دقیقه
	Order       int                              // ترتیب پیشنهاد
	IsActive    bool                             // فعال/غیرفعال
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// UserExercise وضعیت انجام تمرین توسط کاربر
type UserExercise struct {
	UserID      uservalueobject.UserID
	ExerciseID  exercisevalueobject.ExerciseID
	CompletedAt time.Time
	Rating      int // 1 تا 5، اختیاری
}

// خطاهای مربوط به تمرین
var (
	ErrEmptyTitle       = errors.New("عنوان تمرین نمی‌تواند خالی باشد")
	ErrEmptyDescription = errors.New("توضیحات تمرین نمی‌تواند خالی باشد")
	ErrInvalidDuration  = errors.New("مدت زمان تمرین باید بیشتر از ۰ باشد")
	ErrExerciseNotFound = errors.New("تمرین یافت نشد")
	ErrAlreadyCompleted = errors.New("این تمرین قبلاً انجام شده است")
	ErrInvalidRating    = errors.New("امتیاز باید بین ۱ تا ۵ باشد")
)

// NewExercise ساخت تمرین جدید (برای ادمین)
func NewExercise(
	title string,
	description string,
	traumaType assessmentvalueobject.TraumaType,
	mediaURL string,
	duration int,
	order int,
) (Exercise, error) {
	if len(title) == 0 {
		return Exercise{}, ErrEmptyTitle
	}
	if len(description) == 0 {
		return Exercise{}, ErrEmptyDescription
	}
	if duration <= 0 {
		return Exercise{}, ErrInvalidDuration
	}

	now := time.Now()
	return Exercise{
		ID:          exercisevalueobject.NewEexrciseID(),
		Title:       title,
		Description: description,
		TraumaType:  traumaType,
		MediaURL:    mediaURL,
		Duration:    duration,
		Order:       order,
		IsActive:    true,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

// UpdateExercise به‌روزرسانی تمرین (برای ادمین)
func (e *Exercise) UpdateExercise(
	title string,
	description string,
	mediaURL string,
	duration int,
	order int,
	isActive bool,
) error {
	if len(title) == 0 {
		return ErrEmptyTitle
	}
	if len(description) == 0 {
		return ErrEmptyDescription
	}
	if duration <= 0 {
		return ErrInvalidDuration
	}

	e.Title = title
	e.Description = description
	e.MediaURL = mediaURL
	e.Duration = duration
	e.Order = order
	e.IsActive = isActive
	e.UpdatedAt = time.Now()

	return nil
}

// NewUserExercise ثبت انجام تمرین توسط کاربر
func NewUserExercise(
	userID string,
	exerciseID string,
) UserExercise {
	return UserExercise{
		UserID:      uservalueobject.UserID(userID),
		ExerciseID:  exercisevalueobject.ExerciseID(exerciseID),
		CompletedAt: time.Now(),
		Rating:      -1,
	}
}

// AddRating اضافه کردن امتیاز به تمرین انجام شده
func (ue UserExercise) AddRating(rating int) error {
	if rating < 1 || rating > 5 {
		return ErrInvalidRating
	}
	ue.Rating = rating
	return nil
}
