package commitmentservice

import (
	domain "aramina/internal/domain/commitment"
	domainuser "aramina/internal/domain/user"
	"aramina/internal/pkg/cache"
	"aramina/internal/service/commitment/dto"
	"context"
)

type Repository interface {
	ListActiveTemplates(ctx context.Context) ([]domain.CommitmentTemplate, error)
	GetTemplateByID(ctx context.Context, id string) (domain.CommitmentTemplate, error)

	SaveUserCommitment(ctx context.Context, uc domain.UserCommitment) (domain.UserCommitment, error)
	UpdateUserCommitment(ctx context.Context, uc domain.UserCommitment) error
	GetUserCommitmentByID(ctx context.Context, id string, userID string) (domain.UserCommitment, error)
	ListUserCommitments(ctx context.Context, userID string) ([]domain.UserCommitment, error)
}

type UserService interface {
	GetUserByIDService(ID string) (domainuser.User, error)
}

type Service struct {
	repo  Repository
	auth  UserService
	cache cache.Cache
}

func New(repo Repository, auth UserService, c cache.Cache) Service {
	return Service{repo: repo, auth: auth, cache: c}
}

const templatesCacheKey = "commitment:templates:active"

// helper: تبدیل موجودیت به DTO
func toInfo(uc domain.UserCommitment) dto.UserCommitmentInfo {
	return dto.UserCommitmentInfo{
		ID:          string(uc.ID),
		TemplateID:  uc.TemplateID,
		Title:       uc.Title,
		Category:    string(uc.Category),
		Status:      string(uc.Status),
		MoodBefore:  uc.MoodBefore,
		MoodAfter:   uc.MoodAfter,
		MoodDelta:   uc.MoodDelta(),
		Reflection:  uc.Reflection,
		PledgedAt:   uc.PledgedAt,
		CompletedAt: uc.CompletedAt,
	}
}
