package dto

import "time"

// ---- Template ----
type TemplateInfo struct {
	ID           string `json:"id"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	Category     string `json:"category"`
	Icon         string `json:"icon"`
	DurationHint string `json:"duration_hint"`
}

type TemplateListResponse struct {
	Templates []TemplateInfo `json:"templates"`
}

// ---- User commitment ----
type UserCommitmentInfo struct {
	ID          string     `json:"id"`
	TemplateID  string     `json:"template_id"`
	Title       string     `json:"title"`
	Category    string     `json:"category"`
	Status      string     `json:"status"`
	MoodBefore  int        `json:"mood_before"`
	MoodAfter   int        `json:"mood_after"`
	MoodDelta   int        `json:"mood_delta"`
	Reflection  string     `json:"reflection"`
	PledgedAt   time.Time  `json:"pledged_at"`
	CompletedAt *time.Time `json:"completed_at"`
}

// ---- Requests ----
type PledgeRequest struct {
	TemplateID string `json:"template_id"` // اختیاری
	Title      string `json:"title"`       // برای تعهد سفارشی یا override
	Category   string `json:"category"`
	MoodBefore int    `json:"mood_before"` // اختیاری (0 = ثبت‌نشده)
}

type CompleteRequest struct {
	MoodAfter  int    `json:"mood_after"`
	Reflection string `json:"reflection"`
}

// ---- Responses ----
type CommitmentResponse struct {
	Commitment UserCommitmentInfo `json:"commitment"`
}

type CommitmentListResponse struct {
	Commitments []UserCommitmentInfo `json:"commitments"`
}
