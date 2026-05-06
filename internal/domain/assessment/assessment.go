package assessment

import (
	assessmentvalueobject "aramina/internal/domain/assessment/valueobject"
	uservalueobject "aramina/internal/domain/user/valueobject"
	"fmt"
	"time"
)

type Assessment struct {
	ID          assessmentvalueobject.AssessmentID
	UserID      uservalueobject.UserID
	Status      assessmentvalueobject.AssessmentStatus
	StartedAt   time.Time
	CompletedAt *time.Time
	Answers     []Answer
}

type Answer struct {
	QuestionID int
	Score      assessmentvalueobject.AnswerScale
}

func NewAssessment(
	userID uservalueobject.UserID,

) (Assessment, error) {
	return Assessment{
		ID:          assessmentvalueobject.NewAssessmentID(),
		UserID:      userID,
		Status:      assessmentvalueobject.StatusInProgress,
		StartedAt:   time.Now(),
		CompletedAt: nil,
		Answers:     []Answer{}, // آرایه خالی
	}, nil

}

func (a Assessment) CompleteAssessment() {
	now := time.Now()
	a.Status = assessmentvalueobject.StatusCompleted
	a.CompletedAt = &now
}

// AddAnswer یک پاسخ به ارزیابی اضافه می‌کند
func (a Assessment) AddAnswer(questionID int, score assessmentvalueobject.AnswerScale) error {
	if !score.IsValid() {
		return fmt.Errorf("جواب سوال اشتباه است")
	}

	// اگر قبلاً همین سوال پاسخ داده شده، جایگزین کن
	for i, ans := range a.Answers {
		if ans.QuestionID == questionID {
			a.Answers[i].Score = score
			return nil
		}
	}

	// در غیر این صورت اضافه کن
	a.Answers = append(a.Answers, Answer{
		QuestionID: questionID,
		Score:      score,
	})
	return nil
}
