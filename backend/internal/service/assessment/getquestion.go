package assessmentservice

import (
	domain "aramina/internal/domain/assessment"
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/assessment/dto"
	"context"
	"os"
)

func (s Service) GetQuestions(ctx context.Context) ([]dto.QuestionResponse, error) {

	const op = "assessmentservice.GetQuestions"

	// مسیر فایل سوالات از env قابل تنظیم است تا هم در اجرای محلی
	// و هم داخل Docker (data در ./data کپی می‌شود) کار کند.
	questionsPath := os.Getenv("QUESTIONS_FILE")
	if questionsPath == "" {
		questionsPath = "../data/questions.json"
	}

	questions, err := domain.GetAllQuestions(questionsPath)

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
