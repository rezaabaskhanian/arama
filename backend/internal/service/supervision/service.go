package supervisionservice

import (
	domain "aramina/internal/domain/supervision"
	"context"
	"time"
)

type Repository interface {
	SetWantsSupervision(ctx context.Context, userID string, wants bool) error
	GetWantsSupervision(ctx context.Context, userID string) (bool, error)
	SaveMessage(ctx context.Context, userID, senderID, body string, isAuto bool) error
	ListMessagesForUser(ctx context.Context, userID string) ([]domain.Message, error)
	ListSupervisedUsers(ctx context.Context) ([]domain.SupervisedUser, error)
	ListSupervisedUsersWithoutMessageOn(ctx context.Context, date time.Time) ([]domain.SupervisedUser, error)
	ListStaffIDs(ctx context.Context) ([]string, error)
}

// Notifier ارسال نوتیف push به کاربر (پیاده‌سازی: service/device.Service). ممکن است nil باشد.
type Notifier interface {
	NotifyUser(ctx context.Context, userID, title, body string, data map[string]string)
}

type Service struct {
	repo     Repository
	notifier Notifier
}

func New(repo Repository, notifier Notifier) Service {
	return Service{repo: repo, notifier: notifier}
}
