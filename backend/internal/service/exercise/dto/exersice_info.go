package dto

import (
	"time"
)

type ExerciseInfo struct {
	ID string `json:"id"`

	Title       string    `json:"title"`
	TraumaType  string    `json:"trauma_type"`
	Description string    `json:"description"`
	MediaURL    string    `json:"mediaURL"`
	Duration    int       `json:"duration"`
	Order       int       `json:"order"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
