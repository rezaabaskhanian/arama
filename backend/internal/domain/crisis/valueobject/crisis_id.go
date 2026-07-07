package crisisvalueobject

import (
	"errors"

	"github.com/google/uuid"
)

type CrisisID string

func NewCrisisID() CrisisID {
	return CrisisID(uuid.New().String())
}

func ParseCrisisID(id string) (CrisisID, error) {
	if id == "" {
		return "", errors.New("crisis id cannot be empty")
	}
	if _, err := uuid.Parse(id); err != nil {
		return "", errors.New("invalid crisis ID format")
	}
	return CrisisID(id), nil
}

func (c CrisisID) String() string {
	return string(c)
}
