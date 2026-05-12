package assessmentservice

import (
	domain "aramina/internal/domain/assessment"
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/assessment/dto"
	"context"
)

func (s Service) GetQuestions(ctx context.Context) ([]dto.QuestionResponse, error) {

	const op = "assessmentservice.GetQuestions"

	questions, err := domain.GetAllQuestions("../data/questions.json")

	if err != nil {
		return nil, richerror.New(op).WithErr(err).WithMessage("خطا در دریافت سوالات")
	}

	result := make([]dto.QuestionResponse, len(questions))

	for i, q := range questions {
		result[i] = dto.QuestionResponse{
			ID:    q.ID,
			Order: q.Order,
			Text:  q.Text,
		}
	}

	return result, nil

}
