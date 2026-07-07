package validate

import (
	"regexp"
	"strings"
	"unicode/utf8"

	"aramina/internal/pkg/richerror"
)

// اعتبارسنجی سبک و بدون وابستگی خارجی برای ورودی‌های رایج.

var phoneRe = regexp.MustCompile(`^09\d{9}$`)

// Phone شماره‌ی موبایل ایران را بررسی می‌کند (۰۹xxxxxxxxx)
func Phone(op richerror.Op, phone string) error {
	if !phoneRe.MatchString(phone) {
		return richerror.New(op).WithMessage("شماره موبایل نامعتبر است")
	}
	return nil
}

// Required بررسی می‌کند مقدار خالی نباشد (بعد از trim)
func Required(op richerror.Op, field, value string) error {
	if strings.TrimSpace(value) == "" {
		return richerror.New(op).WithMessage(field + " نمی‌تواند خالی باشد")
	}
	return nil
}

// MaxLen حداکثر طول (بر اساس کاراکتر یونیکد، مناسب فارسی)
func MaxLen(op richerror.Op, field, value string, max int) error {
	if utf8.RuneCountInString(value) > max {
		return richerror.New(op).WithMessage(field + " بیش از حد طولانی است")
	}
	return nil
}

// InRange بررسی می‌کند عدد در بازه باشد
func InRange(op richerror.Op, field string, value, min, max int) error {
	if value < min || value > max {
		return richerror.New(op).WithMessage(field + " در بازه‌ی مجاز نیست")
	}
	return nil
}

// Password حداقل طول رمز
func Password(op richerror.Op, pass string, min int) error {
	if utf8.RuneCountInString(pass) < min {
		return richerror.New(op).WithMessage("رمز عبور باید حداقل ۶ کاراکتر باشد")
	}
	return nil
}
