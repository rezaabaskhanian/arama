package assessmentservice

import (
	assessmentvalueobject "aramina/internal/domain/assessment/valueobject"
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/assessment/dto"
	"context"
	"fmt"
	"strconv"
)

func (s Service) SubmitAnswer(ctx context.Context, userID string, assessmentID string, answers map[string]int) (dto.AssessmentResultResponse, error) {

	const op = "assessmentservice.SubmitAnswer"

	user, err := s.auth.GetUserByIDService(userID)
	if err != nil {
		return dto.AssessmentResultResponse{}, richerror.New(op).WithErr(err).WithMessage("چنین یوزری موجود نیست")
	}

	assessment, err := s.repo.FindByID(ctx, string(assessmentID))

	// چک کردن اینکه ارزیابی مال همین کاربر است
	if assessment.UserID != user.ID {
		return dto.AssessmentResultResponse{}, richerror.New(op).WithErr(err).WithMessage("شما دسترسی به این ارزیابی ندارید")
	}

	// add answer

	for questionIDStr, score := range answers {

		questionID, err := strconv.Atoi(questionIDStr)
		if err != nil {
			return dto.AssessmentResultResponse{}, richerror.New(op).WithErr(err).WithMessage("شناسه سوال نامعتبر است")
		}
		if err := assessment.AddAnswer(questionID, assessmentvalueobject.AnswerScale(score)); err != nil {
			fmt.Println(questionID, assessmentvalueobject.AnswerScale(score), "questionID, assessmentvalueobject.AnswerScale(score)")
			return dto.AssessmentResultResponse{}, richerror.New(op).WithErr(err).WithMessage("خطا در ثبت پاسخ")
		}

	}

	if err := assessment.CompleteAssessment(); err != nil {
		return dto.AssessmentResultResponse{}, richerror.New(op).WithErr(err).WithMessage("خطا در تکمیل تست")
	}

	err = s.repo.Update(ctx, assessment)

	if err != nil {
		return dto.AssessmentResultResponse{}, richerror.New(op).WithErr(err).WithMessage("خطا در ذخیره نتیجه")
	}

	return dto.AssessmentResultResponse{
		AssessmentID: string(assessment.ID),
		TotalScore:   assessment.TotalScore,
		TraumaType:   string(assessment.TraumaType),
		TraumaTypeFa: assessment.TraumaType.String(),

		CompletedAt: assessment.CompletedAt,
	}, nil

}
