package commitmentservice

import (
	domain "aramina/internal/domain/commitment"
	vo "aramina/internal/domain/commitment/valueobject"
	uservalueobject "aramina/internal/domain/user/valueobject"
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/commitment/dto"
	"context"
)

// Pledge ثبت تعهد کاربر روی یک الگو یا یک تعهد سفارشی
func (s Service) Pledge(ctx context.Context, req dto.PledgeRequest, userID string) (dto.CommitmentResponse, error) {
	const op = "commitmentservice.Pledge"

	user, err := s.auth.GetUserByIDService(userID)
	if err != nil {
		return dto.CommitmentResponse{}, richerror.New(op).WithErr(err).WithMessage("کاربر یافت نشد")
	}

	title := req.Title
	category := vo.Category(req.Category)

	// اگر بر اساس یک الگو تعهد می‌دهد، اطلاعات را از الگو بردار
	if req.TemplateID != "" {
		tmpl, err := s.repo.GetTemplateByID(ctx, req.TemplateID)
		if err != nil {
			return dto.CommitmentResponse{}, richerror.New(op).WithErr(err).WithMessage("تمرین یافت نشد")
		}
		if title == "" {
			title = tmpl.Title
		}
		category = tmpl.Category
	}

	uc, err := domain.NewUserCommitment(
		uservalueobject.UserID(user.ID),
		req.TemplateID,
		title,
		category,
		req.MoodBefore,
	)
	if err != nil {
		return dto.CommitmentResponse{}, richerror.New(op).WithErr(err).WithMessage(err.Error())
	}

	saved, err := s.repo.SaveUserCommitment(ctx, *uc)
	if err != nil {
		return dto.CommitmentResponse{}, richerror.New(op).WithErr(err).WithMessage("خطا در ثبت تعهد")
	}

	return dto.CommitmentResponse{Commitment: toInfo(saved)}, nil
}
