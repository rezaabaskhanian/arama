package exercisevalueobject

import (
	"errors"

	"github.com/google/uuid"
)

type ExerciseID string

func NewEexrciseID() ExerciseID {
	return ExerciseID(uuid.NewString())
}

func ParseExerciseID(id string) (ExerciseID, error) {
	if id == "" {
		return "", errors.New("exercise id cannot be empty")
	}

	_, err := uuid.Parse(id)
	if err != nil {
		return "", errors.New("invalid UUID format for exercise")
	}

	return ExerciseID(id), nil
}
