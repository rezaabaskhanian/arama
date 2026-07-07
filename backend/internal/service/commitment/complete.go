package commitmentservice

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/commitment/dto"
	"context"
)

// Complete انجام تعهد و ثبت بازخورد احساسی
func (s Service) Complete(ctx context.Context, commitmentID string, req dto.CompleteRequest, userID string) (dto.CommitmentResponse, error) {
	const op = "commitmentservice.Complete"

	uc, err := s.repo.GetUserCommitmentByID(ctx, commitmentID, userID)
	if err != nil {
		return dto.CommitmentResponse{}, richerror.New(op).WithErr(err).WithMessage("تعهد یافت نشد")
	}

	if err := uc.Complete(req.MoodAfter, req.Reflection); err != nil {
		return dto.CommitmentResponse{}, richerror.New(op).WithErr(err).WithMessage(err.Error())
	}

	if err := s.repo.UpdateUserCommitment(ctx, uc); err != nil {
		return dto.CommitmentResponse{}, richerror.New(op).WithErr(err).WithMessage("خطا در ثبت بازخورد")
	}

	return dto.CommitmentResponse{Commitment: toInfo(uc)}, nil
}
