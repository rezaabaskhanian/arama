package assessmentservice

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/assessment/dto"
	"context"
)

func (s Service) GetAssessmentLatest(ctx context.Context, userID string) (dto.AssessmentResultResponse, error) {

	const op = "assessmentservice.GetAssessmentLatest"

	user, err := s.auth.GetUserByIDService(userID)
	if err != nil {
		return dto.AssessmentResultResponse{}, richerror.New(op).WithErr(err).WithMessage("چنین یوزری موجود نیست")
	}
	assessment, err := s.repo.LatestAssessment(ctx, string(user.ID))
	if err != nil {
		return dto.AssessmentResultResponse{}, richerror.New(op).WithErr(err).WithMessage("خطا در ذخیره ارزیابی")
	}

	return dto.AssessmentResultResponse{
		AssessmentID: string(assessment.ID),
		TotalScore:   assessment.TotalScore,
		TraumaType:   string(assessment.TraumaType),
		TraumaTypeFa: assessment.TraumaType.String(),
		CompletedAt:  assessment.CompletedAt,
	}, nil

}
