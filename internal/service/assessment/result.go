package assessmentservice

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/assessment/dto"
	"context"
)

func (s Service) AssessmentResult(ctx context.Context, assessmentID string) (dto.AssessmentResultResponse, error) {
	const op = "assessmentservice.ResultAssessment"

	assessment, err := s.repo.FindByID(ctx, string(assessmentID))

	if err != nil {
		return dto.AssessmentResultResponse{}, richerror.New(op).WithErr(err).WithMessage("dont get from db")
	}

	return dto.AssessmentResultResponse{
		AssessmentID: string(assessment.ID),
		TotalScore:   assessment.TotalScore,
		TraumaType:   string(assessment.TraumaType),
		CompletedAt:  assessment.CompletedAt,
	}, nil
}
