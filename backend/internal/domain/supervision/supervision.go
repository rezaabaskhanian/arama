package supervision

import "time"

// Message یک پیام روانشناس (یا پیام خودکار سیستم) برای یک کاربر
type Message struct {
	ID         string
	UserID     string
	SenderID   string // خالی یعنی پیام خودکار سیستم
	SenderName string
	Body       string
	IsAuto     bool
	CreatedAt  time.Time
}

// SupervisedUser کاربری که خواسته روانشناس احوالش را دنبال کند (برای پنل روانشناس)
type SupervisedUser struct {
	UserID        string
	Nickname      string
	Phone         string
	LatestMood    int        // 0 یعنی ثبت‌نشده
	LastMessageAt *time.Time // آخرین زمانی که برایش پیام فرستاده شده
	MessageCount  int
}
