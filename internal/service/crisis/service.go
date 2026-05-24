package crisisservice

import (
	domain "aramina/internal/domain/crisis"
	crisisvalueobject "aramina/internal/domain/crisis/valueobject"
	"context"

	domainuser "aramina/internal/domain/user"
)

type Repository interface {
	Save(ctx context.Context, crisis *domain.Crisis) error
	Update(ctx context.Context, crisis *domain.Crisis) error
	FindByID(ctx context.Context, id crisisvalueobject.CrisisID) (*domain.Crisis, error)
	FindActiveByUserID(ctx context.Context, userID string) (*domain.Crisis, error)
	FindByUserID(ctx context.Context, userID string, limit, offset int) ([]*domain.Crisis, error)
}

type UserService interface {
	GetUserByIDService(ID string) (domainuser.User, error)
}

type Service struct {
	repo Repository
	auth UserService
}

// 1. DetectAndCreateCrisis  ← مهم
// 2. GetActiveCrisis        ← مهم
// 3. ResolveCrisis          ← مهم
// 4. GetUserCrisisHistory   ← برای نسخه دوم
// 5. CheckFollowUpNeeded    ← برای اعلان‌ها    نیاز به پیگیری دارد یا نه
// 6. MarkFollowUpSent       ← ثبت اینکه پیگیری انجام شد  برای اعلان‌ها
// 7. GetCrisisResources     ← داخل دامین دارد (static)

func New(repo Repository, auth UserService) Service {
	return Service{repo: repo, auth: auth}
}
