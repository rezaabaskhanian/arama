package commitmentservice

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/commitment/dto"
	"context"
)

// ListMine فهرست تعهدهای کاربر
func (s Service) ListMine(ctx context.Context, userID string) (dto.CommitmentListResponse, error) {
	const op = "commitmentservice.ListMine"

	list, err := s.repo.ListUserCommitments(ctx, userID)
	if err != nil {
		return dto.CommitmentListResponse{}, richerror.New(op).WithErr(err).WithMessage("خطا در دریافت تعهدها")
	}

	out := make([]dto.UserCommitmentInfo, 0, len(list))
	for _, uc := range list {
		out = append(out, toInfo(uc))
	}

	return dto.CommitmentListResponse{Commitments: out}, nil
}

// Cancel لغو تعهد
func (s Service) Cancel(ctx context.Context, commitmentID string, userID string) error {
	const op = "commitmentservice.Cancel"

	uc, err := s.repo.GetUserCommitmentByID(ctx, commitmentID, userID)
	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("تعهد یافت نشد")
	}
	if err := uc.Cancel(); err != nil {
		return richerror.New(op).WithErr(err).WithMessage(err.Error())
	}
	if err := s.repo.UpdateUserCommitment(ctx, uc); err != nil {
		return richerror.New(op).WithErr(err).WithMessage("خطا در لغو تعهد")
	}
	return nil
}
