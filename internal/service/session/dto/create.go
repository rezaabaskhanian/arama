package dto

import "time"

type SessionRequest struct {
	PsychologistID string    `json:"psychologist_id"`
	SlotTime       time.Time `json:"slot_time"`
}

type SessionResponse struct {
	SessionInfo SessionInfo `json:"session_info"`
}
