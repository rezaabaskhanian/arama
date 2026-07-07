package assessmentvalueobject

import "github.com/google/uuid"

type AssessmentID string

type ResultID string

func NewResultID() ResultID {
	return ResultID(uuid.NewString())
}

func NewAssessmentID() AssessmentID {
	return AssessmentID(uuid.NewString())
}
