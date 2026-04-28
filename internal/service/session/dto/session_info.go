package dto

import "time"

//omitempty به json.marshal میگه اگه مقدار این فیلد zero value بود اصلا نشون نده

type SessionInfo struct {
	ID             string     `json:"id"`
	UserID         string     `json:"user_id"`
	PsychologistID string     `json:"psychologist_id"`
	SlotTime       time.Time  `json:"slot_time"`
	Status         string     `json:"status"`
	CreatedAt      time.Time  `json:"created_at"`
	CancelledAt    *time.Time `json:"cancelled_at,omitempty"`
	CompletedAt    *time.Time `json:"completed_at,omitempty"`
}
