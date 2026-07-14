package supervisionservice

import (
	"aramina/internal/pkg/richerror"
	"context"
	"time"
)

// iranLoc منطقه‌ی زمانی ایران (UTC+03:30) بدون وابستگی به tzdata
var iranLoc = time.FixedZone("IRST", 12600)

// autoMessageForMood بر اساس آخرین مودِ کاربر یک پیام دلگرم‌کننده می‌سازد
// (وقتی روانشناس تا ساعت ۸ شب پیامی نفرستاده باشد).
func autoMessageForMood(nickname string, mood int) string {
	name := nickname
	if name == "" {
		name = "دوست عزیز"
	}

	switch {
	case mood == 0:
		return "سلام " + name + " 🌱 امروز حالت رو ثبت نکردی. فقط می‌خواستم بگم ما همراهتیم؛ اگر فرصت شد چند لحظه به خودت برس و یک تمرین کوتاه انجام بده. فردا هم روز تازه‌ای است."
	case mood <= 2:
		return "سلام " + name + " 💙 دیدم امروز حالت خیلی خوب نبوده. اشکالی نداره؛ روزهای سخت هم بخشی از مسیرند. یک تمرین تنفس آرام انجام بده و اگر لازم شد از بخش «کمک فوری» استفاده کن. تنها نیستی."
	case mood == 3:
		return "سلام " + name + " 🌿 امروز حالت متعادل بوده. همین که هر روز کنار خودت می‌مانی ارزشمند است. یک تمرین کوچک امروز می‌تواند حالت را یک پله بهتر کند."
	default:
		return "سلام " + name + " ☀️ خوشحالم که این روزها حالت بهتر بوده! این انرژی مثبت را نگه دار و به تمرین‌هایت ادامه بده. بهت افتخار می‌کنم."
	}
}

// RunDailyFallback برای همه‌ی کاربرانِ تحت نظارتی که امروز (به‌وقت ایران) پیامی نگرفته‌اند،
// یک پیام خودکارِ متناسب با حالشان می‌فرستد. تعداد پیام‌های ارسالی را برمی‌گرداند.
func (s Service) RunDailyFallback(ctx context.Context) (int, error) {
	const op = "supervisionservice.RunDailyFallback"

	today := time.Now().In(iranLoc)

	users, err := s.repo.ListSupervisedUsersWithoutMessageOn(ctx, today)
	if err != nil {
		return 0, richerror.New(op).WithErr(err)
	}

	sent := 0
	for _, u := range users {
		body := autoMessageForMood(u.Nickname, u.LatestMood)
		// senderID خالی یعنی پیام خودکار سیستم، isAuto = true
		if err := s.repo.SaveMessage(ctx, u.UserID, "", body, true); err != nil {
			// یک خطا نباید کل اجرا را متوقف کند؛ ادامه بده
			continue
		}
		sent++

		// نوتیف push خودکار (best-effort)
		if s.notifier != nil {
			go s.notifier.NotifyUser(context.Background(), u.UserID,
				"آرامینا کنارت است 🌿",
				"یک پیام تازه برایت آماده است.",
				map[string]string{"type": "supervision_auto"})
		}
	}

	return sent, nil
}
