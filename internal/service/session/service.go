package sessionservice

import (
	"context"

	domain "aramina/internal/domain/session"
	domainuser "aramina/internal/domain/user"
	// sessionvalueobject "aramina/internal/domain/session/valueobject"
)

type Repository interface {
	Save(ctx context.Context, s domain.Session) (domain.Session, error)
	Update(ctx context.Context, s domain.Session) (domain.Session, error)
	GetSessionByID(ctx context.Context, id string) (domain.Session, error)
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
