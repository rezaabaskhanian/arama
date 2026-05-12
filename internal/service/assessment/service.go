package assessmentservice

import (
	domain "aramina/internal/domain/assessment"
	domainuser "aramina/internal/domain/user"

	"context"
)

type Repository interface {
	// ذخیره ارزیابی جدید
	Save(ctx context.Context, assessment domain.Assessment) error

	// به‌روزرسانی ارزیابی (برای اضافه کردن پاسخ‌ها و تکمیل)
	Update(ctx context.Context, assessment domain.Assessment) error

	// پیدا کردن ارزیابی با ID
	FindByID(ctx context.Context, id string) (domain.Assessment, error)

	// // پیدا کردن آخرین ارزیابی کاربر (برای نمایش در پروفایل)
	// FindLatestByUserID(ctx context.Context, userID string) (domain.Assessment, error)

	// // پیدا کردن همه ارزیابی‌های کاربر (تاریخچه)
	// FindByUserID(ctx context.Context, userID string) ([]domain.Assessment, error)
}

type UserService interface {
	GetUserByIDService(ID string) (domainuser.User, error)
}

type Service struct {
	repo Repository
	auth UserService
}

func New(repo Repository, auth UserService) Service {
	return Service{repo: repo, auth: auth}
}
