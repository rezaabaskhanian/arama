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
}

type Service struct {
	repo Repository
}

func New(repo Repository) Service {
	return Service{repo: repo}
}
