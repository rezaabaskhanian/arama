package user

// نقش‌های معتبر کاربر — تنها منبع حقیقت برای مقادیر ستون role.
// این ثابت‌ها باید همه‌جا (میدلور، سرویس‌ها، هندلرها) به‌جای رشته‌ی خام استفاده شوند.
const (
	RoleUser      = "user"      // کاربر عادی
	RoleTherapist = "therapist" // روانشناس — دسترسی به پنل نظارت/همراهی
	RoleAdmin     = "admin"     // مدیر کل — دسترسی کامل
)

// ValidRole مشخص می‌کند که آیا role یکی از نقش‌های شناخته‌شده است یا نه.
func ValidRole(role string) bool {
	switch role {
	case RoleUser, RoleTherapist, RoleAdmin:
		return true
	default:
		return false
	}
}
