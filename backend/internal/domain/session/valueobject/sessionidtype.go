package sessionvalueobject

import "github.com/google/uuid"

type SessionID string

type PsychologistID string

type SessionStatus string

const (
	SessionScheduled SessionStatus = "scheduled"
	SessionCancelled SessionStatus = "cancelled"

	SessionCompleted SessionStatus = "completed"
)

func NewSessionID() SessionID {
	return SessionID(uuid.NewString())
}

func NewPsychologistID() PsychologistID {
	return PsychologistID(uuid.NewString())
}
