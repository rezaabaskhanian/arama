package journalservice

import (
	domain "aramina/internal/domain/journal"
	domainuser "aramina/internal/domain/user"
	"context"
	"time"
)

type Repository interface {
	Save(ctx context.Context, j domain.Journal) (domain.Journal, error)
	Update(ctx context.Context, entry domain.Journal) error
	FindByID(ctx context.Context, id string, userID string) (domain.Journal, error)
	FindByUserID(ctx context.Context, userID string, limit, offset int) ([]domain.Journal, error)
	CountTodayEntries(ctx context.Context, id string) (int, error) // برای قانون ۳ بار در روز
	Delete(ctx context.Context, id string) error
	GetMoodByDateRange(ctx context.Context, userID string, start, end time.Time) (int, error)

	UpsertTodayMood(ctx context.Context, userID string, mood int) error

	GetCurrentStreak(ctx context.Context, userID string) (int, error)

	CountByUserID(ctx context.Context, userID string) (int, error)

	GetRecentMoods(ctx context.Context, userID string, days int) ([]int, error)

	GetLatestJournalContent(ctx context.Context, userID string) (string, error)
}

type UserService interface {
	GetUserByIDService(ID string) (domainuser.User, error)
}

//GetUserJournalEntries
// UpdateJournalEntry
// DeleteJournalEntry

type Service struct {
	repo Repository
	auth UserService
}

func New(repo Repository, auth UserService) Service {
	return Service{
		repo: repo,
		auth: auth,
	}
}
