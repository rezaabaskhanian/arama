package adminservice

import (
	commitmentdomain "aramina/internal/domain/commitment"
	assessmentservice "aramina/internal/service/assessment"
	exerciseservice "aramina/internal/service/exercise"
	userservice "aramina/internal/service/user"
	"context"
)

// CommitmentRepo متدهای مدیریت الگوهای تمرین واقعی زندگی برای ادمین
type CommitmentRepo interface {
	ListAllTemplates(ctx context.Context) ([]commitmentdomain.CommitmentTemplate, error)
	GetTemplateByID(ctx context.Context, id string) (commitmentdomain.CommitmentTemplate, error)
	CreateTemplate(ctx context.Context, t commitmentdomain.CommitmentTemplate) (commitmentdomain.CommitmentTemplate, error)
	UpdateTemplate(ctx context.Context, t commitmentdomain.CommitmentTemplate) error
	DeleteTemplate(ctx context.Context, id string) error
	CountTemplates(ctx context.Context) (int, error)
}

type Service struct {
	userRepo       userservice.Repository
	exerciseRepo   exerciseservice.Repository
	assessmentRepo assessmentservice.Repository
	commitmentRepo CommitmentRepo
}

func New(userRepo userservice.Repository,
	exerciseRepo exerciseservice.Repository,
	assessmentRepo assessmentservice.Repository,
	commitmentRepo CommitmentRepo) Service {

	return Service{
		userRepo:       userRepo,
		exerciseRepo:   exerciseRepo,
		assessmentRepo: assessmentRepo,
		commitmentRepo: commitmentRepo,
	}

}
