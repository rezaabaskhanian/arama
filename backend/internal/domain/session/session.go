package session

import (
	sessionvalueobject "aramina/internal/domain/session/valueobject"
	uservalueobject "aramina/internal/domain/user/valueobject"
	"fmt"
	"time"
)

type Session struct {
	ID             sessionvalueobject.SessionID
	UserID         uservalueobject.UserID
	PsychologistID sessionvalueobject.PsychologistID
	SlotTime       time.Time
	Status         sessionvalueobject.SessionStatus
	CreatedAt      time.Time
	CancelledAt    *time.Time
	CompletedAt    *time.Time
}

func NewSession(
	userID uservalueobject.UserID,
	psychologistID sessionvalueobject.PsychologistID,
	slotTime time.Time,
) (Session, error) {

	if slotTime.Before(time.Now()) {
		return Session{}, fmt.Errorf("نمیتوانیم این وقت را رزرو کنیم")
	}

	return Session{
		ID:             sessionvalueobject.NewSessionID(),
		UserID:         userID,
		PsychologistID: psychologistID,
		SlotTime:       slotTime,
		Status:         sessionvalueobject.SessionScheduled,
		CreatedAt:      time.Now(),
	}, nil
}

func (s *Session) Cancel(requestUserID uservalueobject.UserID) error {
	if s.UserID != requestUserID {
		return fmt.Errorf("شما اجازه کنسل کردن این جلسه را ندارید")
	}

	if s.Status != sessionvalueobject.SessionScheduled {
		return fmt.Errorf("این جلسه قابل کنسل نیست")
	}
	now := time.Now()
	s.Status = sessionvalueobject.SessionCancelled
	s.CancelledAt = &now
	return nil
}

func (s *Session) Complete(requestUserID uservalueobject.UserID) error {
	if s.UserID != requestUserID {
		return fmt.Errorf("شما اجازه کنسل کردن این جلسه را ندارید")
	}

	if s.Status != sessionvalueobject.SessionScheduled {
		return fmt.Errorf("فقط جلسات برنامه‌ریزی‌شده می‌توانند تکمیل شوند")
	}

	now := time.Now()
	s.Status = sessionvalueobject.SessionCompleted
	s.CompletedAt = &now
	return nil
}
