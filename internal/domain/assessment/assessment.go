package assessment

import (
	assessmentvalueobject "aramina/internal/domain/assessment/valueobject"
	uservalueobject "aramina/internal/domain/user/valueobject"
	"fmt"
	"time"
)

type Answer struct {
	QuestionID int
	Score      assessmentvalueobject.AnswerScale
}
type Assessment struct {
	ID         assessmentvalueobject.AssessmentID
	UserID     uservalueobject.UserID
	Status     assessmentvalueobject.AssessmentStatus
	Answers    []Answer
	TraumaType assessmentvalueobject.TraumaType
	TotalScore int

	StartedAt   time.Time
	CompletedAt *time.Time
}

func NewAssessment(
	userID uservalueobject.UserID,

) (Assessment, error) {
	return Assessment{
		ID:         assessmentvalueobject.NewAssessmentID(),
		UserID:     userID,
		Status:     assessmentvalueobject.StatusInProgress,
		StartedAt:  time.Now(),
		TotalScore: 0,
		Answers:    []Answer{}, // آرایه خالی
	}, nil

}

func (a *Assessment) CalculateTotalScore() int {
	total := 0
	for _, ans := range a.Answers {
		total += ans.Score.Int()
	}
	a.TotalScore = total
	return total
}

func (a *Assessment) DetermineTraumaType() assessmentvalueobject.TraumaType {
	score := a.CalculateTotalScore()

	switch {
	case score <= 20:
		a.TraumaType = assessmentvalueobject.TraumaMild
	case score <= 32:
		a.TraumaType = assessmentvalueobject.TraumaModerate
	case score <= 50:
		a.TraumaType = assessmentvalueobject.TraumaSevere
	default:
		a.TraumaType = assessmentvalueobject.TraumaComplex
	}

	return a.TraumaType
}

func (a *Assessment) CompleteAssessment() error {
	if a.Status == assessmentvalueobject.StatusCompleted {
		return fmt.Errorf("جواب تست قبلا داده شده است")
	}

	if len(a.Answers) == 0 {
		return fmt.Errorf("کامل نیست")
	}

	a.CalculateTotalScore()
	a.DetermineTraumaType()
	a.Status = assessmentvalueobject.StatusCompleted
	now := time.Now()
	a.CompletedAt = &now

	return nil
}

// AddAnswer یک پاسخ به ارزیابی اضافه می‌کند
func (a *Assessment) AddAnswer(questionID int, score assessmentvalueobject.AnswerScale) error {
	if a.Status == assessmentvalueobject.StatusCompleted {
		return fmt.Errorf("جواب تست قبلا داده شده است")
	}
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
