package deviceservice

import "context"

// Repository ذخیره‌ی توکن‌های دستگاه
type Repository interface {
	SaveToken(ctx context.Context, userID, token, platform string) error
	TokensForUser(ctx context.Context, userID string) ([]string, error)
	DeleteTokens(ctx context.Context, tokens []string) error
}

// Pusher لایه‌ی ارسال push (پیاده‌سازی: service/push.FCM). خروجی، توکن‌های باطل‌شده است.
type Pusher interface {
	Push(ctx context.Context, tokens []string, title, body string, data map[string]string) ([]string, error)
}

type Service struct {
	repo   Repository
	pusher Pusher // ممکن است nil باشد (وقتی FCM پیکربندی نشده)
}

func New(repo Repository, pusher Pusher) Service {
	return Service{repo: repo, pusher: pusher}
}
