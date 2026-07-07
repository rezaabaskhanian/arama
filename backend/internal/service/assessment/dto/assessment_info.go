package dto

import "time"

type AssessmentInfo struct {
	ID          string     `json:"id"`
	UserID      string     `json:"user_id"`
	Status      string     `json:"status"`
	TotalScore  int        `json:"total_score"`
	TraumaType  string     `json:"trauma_type"`
	Answers     []Answer   `json:"answers,omitempty"`
	StartedAt   time.Time  `json:"started_at"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
}
