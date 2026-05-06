package journalservice

import (
	domain "aramina/internal/domain/journal"
	domainuser "aramina/internal/domain/user"
	"context"
)

type Repository interface {
	Save(ctx context.Context, j domain.Journal) (domain.Journal, error)
	// Update(ctx context.Context, entry *JournalEntry) error
	// FindByID(ctx context.Context, id uuid.UUID) (*JournalEntry, error)
	// FindByUserID(ctx context.Context, userID uservalueobject.UserID, limit, offset int) ([]*JournalEntry, error)
	CountTodayEntries(ctx context.Context, id string) (int, error) // برای قانون ۳ بار در روز
	// Delete(ctx context.Context, id uuid.UUID) error

}

type UserService interface {
	GetUserByIDService(ID string) (domainuser.User, error)
}

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
