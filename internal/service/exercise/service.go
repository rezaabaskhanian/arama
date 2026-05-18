package exerciseservice

import (
	domain "aramina/internal/domain/exercise"
	domainuser "aramina/internal/domain/user"
	"context"
)

type Repository interface {
	//تمرین ها
	SaveExercise(ctx context.Context, exercise domain.Exercise) (domain.Exercise, error)

	// UpdateExercise(ctx context.Context, exercise *Exercise) error
	FindExerciseByID(ctx context.Context, id string) (domain.Exercise, error)
	FindExercisesByTraumaType(ctx context.Context, traumaType string) ([]domain.Exercise, error)
	// FindAllExercises(ctx context.Context, isActive *bool) ([]*Exercise, error)
	// DeleteExercise(ctx context.Context, id uuid.UUID) error

	// وضعیت انجام تمرین توسط کاربر
	SaveUserExercise(ctx context.Context, userID, exerciseID string) error
	// FindUserExercise(ctx context.Context, userID uservalueobject.UserID, exerciseID uuid.UUID) (*UserExercise, error)
	// FindUserCompletedExercises(ctx context.Context, userID uservalueobject.UserID) ([]*UserExercise, error)
	CountTotalExercies(ctx context.Context, traumaType string) (int, error)
	CountUserCompletedExercises(ctx context.Context, userID string) (int, error)
	IsExerciseCompletedByUser(ctx context.Context, userID string, exerciseID string) (bool, error)
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
