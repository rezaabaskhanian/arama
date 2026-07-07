package commitment

import (
	vo "aramina/internal/domain/commitment/valueobject"
	uservalueobject "aramina/internal/domain/user/valueobject"
	"aramina/internal/pkg/richerror"
	"time"
)

// CommitmentTemplate الگوی «تمرین واقعی زندگی» که ادمین تعریف می‌کند
type CommitmentTemplate struct {
	ID           vo.CommitmentID
	Title        string
	Description  string
	Category     vo.Category
	Icon         string
	DurationHint string
	IsActive     bool
	OrderIndex   int
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// NewCommitmentTemplate ساخت الگوی تمرین واقعی (برای ادمین)
func NewCommitmentTemplate(
	title string,
	description string,
	category vo.Category,
	icon string,
	durationHint string,
	orderIndex int,
) (*CommitmentTemplate, error) {
	const op = "commitment.NewCommitmentTemplate"

	if len(title) == 0 {
		return nil, richerror.New(op).WithMessage("عنوان تمرین نمی‌تواند خالی باشد")
	}
	if len(description) == 0 {
		return nil, richerror.New(op).WithMessage("توضیحات تمرین نمی‌تواند خالی باشد")
	}
	if !category.IsValid() {
		return nil, richerror.New(op).WithMessage("دسته‌بندی نامعتبر است")
	}
	if icon == "" {
		icon = "sparkles"
	}

	now := time.Now()
	return &CommitmentTemplate{
		ID:           vo.NewCommitmentID(),
		Title:        title,
		Description:  description,
		Category:     category,
		Icon:         icon,
		DurationHint: durationHint,
		IsActive:     true,
		OrderIndex:   orderIndex,
		CreatedAt:    now,
		UpdatedAt:    now,
	}, nil
}

// Update به‌روزرسانی الگو (برای ادمین)
func (t *CommitmentTemplate) Update(title, description string, category vo.Category, icon, durationHint string, orderIndex int, isActive bool) error {
	const op = "commitment.CommitmentTemplate.Update"

	if len(title) == 0 {
		return richerror.New(op).WithMessage("عنوان تمرین نمی‌تواند خالی باشد")
	}
	if len(description) == 0 {
		return richerror.New(op).WithMessage("توضیحات تمرین نمی‌تواند خالی باشد")
	}
	if !category.IsValid() {
		return richerror.New(op).WithMessage("دسته‌بندی نامعتبر است")
	}
	t.Title = title
	t.Description = description
	t.Category = category
	if icon != "" {
		t.Icon = icon
	}
	t.DurationHint = durationHint
	t.OrderIndex = orderIndex
	t.IsActive = isActive
	t.UpdatedAt = time.Now()
	return nil
}

// UserCommitment تعهد کاربر روی یک تمرین واقعی + بازخورد احساسی پس از انجام
type UserCommitment struct {
	ID          vo.CommitmentID
	UserID      uservalueobject.UserID
	TemplateID  string // ممکن است خالی باشد (تعهد سفارشی)
	Title       string
	Category    vo.Category
	Status      vo.Status
	MoodBefore  int // 0 = ثبت‌نشده، 1..5
	MoodAfter   int // 0 = ثبت‌نشده، 1..5
	Reflection  string
	PledgedAt   time.Time
	CompletedAt *time.Time
}

// NewUserCommitment ثبت یک تعهد جدید
func NewUserCommitment(
	userID uservalueobject.UserID,
	templateID string,
	title string,
	category vo.Category,
	moodBefore int,
) (*UserCommitment, error) {
	const op = "commitment.NewUserCommitment"

	if len(title) == 0 {
		return nil, richerror.New(op).WithMessage("عنوان تعهد نمی‌تواند خالی باشد")
	}
	if len(title) > 200 {
		return nil, richerror.New(op).WithMessage("عنوان تعهد بیش از حد طولانی است")
	}
	if !category.IsValid() {
		category = vo.CategoryCommunity
	}
	if moodBefore != 0 && (moodBefore < 1 || moodBefore > 5) {
		return nil, richerror.New(op).WithMessage("حس‌وحال باید بین ۱ تا ۵ باشد")
	}

	return &UserCommitment{
		ID:         vo.NewCommitmentID(),
		UserID:     userID,
		TemplateID: templateID,
		Title:      title,
		Category:   category,
		Status:     vo.StatusPledged,
		MoodBefore: moodBefore,
		PledgedAt:  time.Now(),
	}, nil
}

// Complete انجام تعهد و ثبت بازخورد احساسی
func (u *UserCommitment) Complete(moodAfter int, reflection string) error {
	const op = "commitment.Complete"

	if u.Status == vo.StatusCompleted {
		return richerror.New(op).WithMessage("این تعهد قبلاً انجام شده است")
	}
	if u.Status == vo.StatusCancelled {
		return richerror.New(op).WithMessage("این تعهد لغو شده است")
	}
	if moodAfter < 1 || moodAfter > 5 {
		return richerror.New(op).WithMessage("حس‌وحال پس از انجام باید بین ۱ تا ۵ باشد")
	}
	if len(reflection) > 1000 {
		return richerror.New(op).WithMessage("متن بازخورد بیش از ۱۰۰۰ کاراکتر است")
	}

	now := time.Now()
	u.Status = vo.StatusCompleted
	u.MoodAfter = moodAfter
	u.Reflection = reflection
	u.CompletedAt = &now
	return nil
}

// Cancel لغو تعهد
func (u *UserCommitment) Cancel() error {
	const op = "commitment.Cancel"
	if u.Status == vo.StatusCompleted {
		return richerror.New(op).WithMessage("تعهد انجام‌شده را نمی‌توان لغو کرد")
	}
	u.Status = vo.StatusCancelled
	return nil
}

// MoodDelta تغییر حس‌وحال (پس از انجام منهای قبل)
func (u UserCommitment) MoodDelta() int {
	if u.MoodBefore == 0 || u.MoodAfter == 0 {
		return 0
	}
	return u.MoodAfter - u.MoodBefore
}
