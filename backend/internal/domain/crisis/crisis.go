package crisis

import (
	crisisvalueobject "aramina/internal/domain/crisis/valueobject"
	uservalueobject "aramina/internal/domain/user/valueobject"
	"errors"
	"time"
)

type Crisis struct {
	ID             crisisvalueobject.CrisisID
	UserID         uservalueobject.UserID
	Level          crisisvalueobject.CrisisLevel
	Status         crisisvalueobject.CrisisStatus
	TriggeredBy    crisisvalueobject.TriggerType // نحوه پیدا کردن نوع بحران
	Score          int                           // امتیاز محاسبه شده (0-10)
	Message        string                        // پیام مناسب برای کاربر
	Resources      []crisisvalueobject.CrisisResource
	CreatedAt      time.Time
	ResolvedAt     *time.Time
	FollowUpSentAt *time.Time
	FollowUpCount  int
}

// NewCrisis ایجاد یک بحران جدید
func NewCrisis(
	userID uservalueobject.UserID,
	level crisisvalueobject.CrisisLevel,
	triggeredBy crisisvalueobject.TriggerType,
	score int,
) *Crisis {
	return &Crisis{
		ID:            crisisvalueobject.NewCrisisID(),
		UserID:        userID,
		Level:         level,
		Status:        crisisvalueobject.StatusDetected,
		TriggeredBy:   triggeredBy,
		Score:         score,
		Message:       getDefaultMessage(level, triggeredBy),
		Resources:     getDefaultResources(level),
		CreatedAt:     time.Now(),
		FollowUpCount: 0,
	}
}

// Resolve حل کردن بحران
func (c *Crisis) Resolve() error {
	if c.Status == crisisvalueobject.StatusResolved {
		return errors.New("crisis already resolved")
	}
	now := time.Now()
	c.ResolvedAt = &now
	c.Status = crisisvalueobject.StatusResolved
	return nil
}

// Escalate ارجاع به سطح بالاتر
func (c *Crisis) Escalate() {
	c.Status = crisisvalueobject.StatusEscalated
}

// MarkNotified علامت زدن اینکه هشدار داده شده
func (c *Crisis) MarkNotified() {
	c.Status = crisisvalueobject.StatusNotified
}

// ShouldFollowUp آیا نیاز به پیگیری دارد؟
func (c *Crisis) ShouldFollowUp() bool {
	if c.FollowUpCount >= 2 {
		return false
	}
	if c.Status == crisisvalueobject.StatusResolved {
		return false
	}
	if c.FollowUpSentAt == nil {
		return true
	}
	return time.Since(*c.FollowUpSentAt) > 24*time.Hour
}

// MarkFollowUpSent ثبت پیگیری ارسال شده
func (c *Crisis) MarkFollowUpSent() {
	now := time.Now()
	c.FollowUpSentAt = &now
	c.FollowUpCount++
}

// getDefaultMessage پیام پیش‌فرض بر اساس سطح بحران
func getDefaultMessage(level crisisvalueobject.CrisisLevel, trigger crisisvalueobject.TriggerType) string {
	switch level {
	case crisisvalueobject.LevelWarning:
		return "با توجه به وضعیت اخیر، بهتر است بیشتر مراقب خودت باشی. انجام تمرینات آرام‌بخش می‌تواند کمک‌کننده باشد."
	case crisisvalueobject.LevelNeedHelp:
		return "به نظر می‌رسد نیاز به کمک داری. لطفاً با خطوط بحران تماس بگیر یا با یک متخصص صحبت کن."
	case crisisvalueobject.LevelEmergency:
		return "وضعیت تو نیاز به توجه فوری دارد. لطفاً همین الان با خطوط بحران تماس بگیر."
	default:
		return "وضعیت عادی است. به مسیر بهبودی ادامه بده."
	}
}

// getDefaultResources منابع پیش‌فرض بر اساس سطح بحران
func getDefaultResources(level crisisvalueobject.CrisisLevel) []crisisvalueobject.CrisisResource {
	resources := []crisisvalueobject.CrisisResource{}

	switch level {
	case crisisvalueobject.LevelWarning:
		resources = append(resources, crisisvalueobject.NewBreathingExerciseResource())
		resources = append(resources, crisisvalueobject.NewPhoneResource("خط ملی بحران", "۱۲۳", "۲۴ ساعته"))

	case crisisvalueobject.LevelNeedHelp:
		resources = append(resources, crisisvalueobject.NewPhoneResource("خط ملی بحران", "۱۲۳", "۲۴ ساعته"))
		resources = append(resources, crisisvalueobject.NewPhoneResource("اورژانس روانشناسی", "۱۴۸۰", "۲۴ ساعته"))

	case crisisvalueobject.LevelEmergency:
		resources = append(resources, crisisvalueobject.NewPhoneResource("اورژانس (فوری)", "۱۱۵", "تماس فوری"))
		resources = append(resources, crisisvalueobject.NewPhoneResource("خط ملی بحران", "۱۲۳", "۲۴ ساعته"))
	}

	return resources
}
