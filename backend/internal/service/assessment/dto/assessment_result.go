package dto

import "time"

type AssessmentResultResponse struct {
	AssessmentID string     `json:"assessment_id"`
	TotalScore   int        `json:"total_score"`
	TraumaType   string     `json:"trauma_type"`
	TraumaTypeFa string     `json:"trauma_type_fa"`
	CompletedAt  *time.Time `json:"completed_at"`
}
