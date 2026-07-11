package exerciseservice

import (
	domain "aramina/internal/domain/exercise"
	"time"
)

// منطقه‌ی زمانی ایران (UTC+03:30). ایران از ۱۴۰۱ ساعت تابستانی ندارد، پس آفست ثابت درست است.
// از FixedZone استفاده می‌کنیم تا به وجود tzdata در ایمیج Alpine وابسته نباشیم.
var iranLoc = time.FixedZone("IRST", 12600) // 3*3600 + 30*60

// isTodayTehran بررسی می‌کند که زمان داده‌شده در «امروزِ» تقویم ایران باشد.
func isTodayTehran(t time.Time) bool {
	now := time.Now().In(iranLoc)
	tt := t.In(iranLoc)
	y1, m1, d1 := now.Date()
	y2, m2, d2 := tt.Date()
	return y1 == y2 && m1 == m2 && d1 == d2
}

// nextTehranDayStart شروع روز بعدِ تقویم ایران را برمی‌گرداند (برای نمایش «فردا باز می‌شود»).
func nextTehranDayStart() time.Time {
	now := time.Now().In(iranLoc)
	y, m, d := now.Date()
	return time.Date(y, m, d+1, 0, 0, 0, 0, iranLoc)
}

// nextUnlockIndex اندیس اولین تمرینِ تکمیل‌نشده را در لیست مرتب‌شده برمی‌گرداند.
// اگر همه تکمیل شده باشند -1 برمی‌گرداند.
func nextUnlockIndex(ordered []domain.Exercise, completed map[string]bool) int {
	for i, ex := range ordered {
		if !completed[string(ex.ID)] {
			return i
		}
	}
	return -1
}
