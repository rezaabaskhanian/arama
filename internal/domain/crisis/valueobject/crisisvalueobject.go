package crisisvalueobject

import "github.com/google/uuid"

type CrisisID string
type UserID string
type ExerciseID string

func NewCrisisID() CrisisID {
	return CrisisID(uuid.NewString())
}

func NewExerciseID() ExerciseID {
	return ExerciseID(uuid.NewString())
}
