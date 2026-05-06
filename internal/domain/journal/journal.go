package journal

import (
	journalvalueobject "aramina/internal/domain/journal/valueobject"
	uservalueobject "aramina/internal/domain/user/valueobject"
	"aramina/internal/pkg/richerror"
	"time"
)

type Journal struct {
	ID        journalvalueobject.JournalID
	UserID    uservalueobject.UserID
	Content   string
	Mood      journalvalueobject.MoodType // 1 تا 5
	CreatedAt time.Time
	UpdatedAt time.Time
	// Tags حذف شد
}

func NewJournal(userID uservalueobject.UserID,
	content string,
	mood journalvalueobject.MoodType,
	todayEntriesCount int, // تعداد یادداشت های کاربر
) (Journal, error) {
	const op = "journal.NewJournal"

	// قانون ۱: متن خالی نباشد
	if len(content) == 0 {
		return Journal{}, richerror.New(op).WithMessage("متن یادداشت نمیتواند خالی باشد")
	}

	if len(content) > 1000 {
		return Journal{}, richerror.New(op).WithMessage("متن یادداشت بیشتر از ۱۰۰۰ کاراکتر است ")
	}
	if todayEntriesCount >= 3 {
		return Journal{}, richerror.New(op).WithMessage("امروز بیش از ۳ بار یادداشت نوشته‌اید")
	}

	now := time.Now()
	return Journal{
		ID:        journalvalueobject.NewJournalID(),
		UserID:    userID,
		Content:   content,
		Mood:      mood,
		CreatedAt: now,
		UpdatedAt: now,
	}, nil

}

// UpdateContent به‌روزرسانی متن با اعتبارسنجی
func (j *Journal) UpdateContent(newContent string) error {
	const op = "journal.UpdateContent"
	if len(newContent) == 0 {
		return richerror.New(op).WithMessage("متن یادداشت نمیتواند خالی باشد")
	}
	if len(newContent) > 1000 {
		return richerror.New(op).WithMessage("متن یادداشت بیشتر از ۱۰۰۰ کاراکتر است ")
	}

	j.Content = newContent
	j.UpdatedAt = time.Now()
	return nil
}

// UpdateMood به‌روزرسانی مود
func (j *Journal) UpdateMood(newMood journalvalueobject.MoodType) {
	j.Mood = newMood
	j.UpdatedAt = time.Now()
}

// IsToday بررسی می‌کند یادداشت مربوط به امروز است یا نه
func (j *Journal) IsToday() bool {
	now := time.Now()
	return j.CreatedAt.Year() == now.Year() &&
		j.CreatedAt.Month() == now.Month() &&
		j.CreatedAt.Day() == now.Day()
}
