package assessmentservice

import (
	"context"

	domain "aramina/internal/domain/assessment"
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/assessment/dto"
)

func (s Service) StartAssessment(ctx context.Context, userID string) (dto.AssessmentCreateResponse, error) {
	const op = "assessmentservice.StartAssessment"

	// بررسی وجود کاربر
	user, err := s.auth.GetUserByIDService(userID)
	if err != nil {
		return dto.AssessmentCreateResponse{}, richerror.New(op).WithErr(err).WithMessage("چنین یوزری موجود نیست")
	}

	// ساخت ارزیابی جدید
	newAssessment, err := domain.NewAssessment(user.ID)
	if err != nil {
		return dto.AssessmentCreateResponse{}, richerror.New(op).WithErr(err).WithMessage("خطا در ایجاد ارزیابی جدید")
	}

	// ذخیره در دیتابیس
	err = s.repo.Save(ctx, newAssessment)
	if err != nil {
		return dto.AssessmentCreateResponse{}, richerror.New(op).WithErr(err).WithMessage("خطا در ذخیره ارزیابی")
	}

	// تبدیل پاسخ‌ها به DTO
	answerDTOs := make([]dto.Answer, len(newAssessment.Answers))
	for i, ans := range newAssessment.Answers {
		answerDTOs[i] = dto.Answer{
			QuestionID: ans.QuestionID,
			Score:      ans.Score.Int(),
		}
	}

	// ساخت پاسخ
	return dto.AssessmentCreateResponse{
		Assessment: dto.AssessmentInfo{
			ID:          string(newAssessment.ID),
			UserID:      string(user.ID),
			Status:      string(newAssessment.Status),
			TotalScore:  newAssessment.TotalScore,
			TraumaType:  string(newAssessment.TraumaType),
			Answers:     answerDTOs,
			StartedAt:   newAssessment.StartedAt,
			CompletedAt: newAssessment.CompletedAt,
		},
	}, nil
}
