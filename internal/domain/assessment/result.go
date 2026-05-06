package assessment

import (
	assessmentvalueobject "aramina/internal/domain/assessment/valueobject"
	uservalueobject "aramina/internal/domain/user/valueobject"
	"time"
)

type Result struct {
	ID           assessmentvalueobject.ResultID
	UserID       uservalueobject.UserID
	AssessmentID assessmentvalueobject.AssessmentID
	TotalScore   int
	TraumaType   assessmentvalueobject.TraumaType
	CreatedAt    time.Time
}

func CalculateTraumaType(score int) assessmentvalueobject.TraumaType {
	switch {
	case score <= 20:
		return assessmentvalueobject.TraumaMild
	case score <= 32:
		return assessmentvalueobject.TraumaModerate
	case score <= 50:
		return assessmentvalueobject.TraumaSevere
	default:
		return assessmentvalueobject.TraumaComplex
	}
}
