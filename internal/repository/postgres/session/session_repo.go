package postgressession

import (
	domain "aramina/internal/domain/session"
	sessionvalueobject "aramina/internal/domain/session/valueobject"
	"aramina/internal/pkg/richerror"
	"context"
)

func (d DB) Save(ctx context.Context, s domain.Session) (domain.Session, error) {
	const op = "postgressession.Save"

	query := `
	INSERT INTO sessions (id, user_id, psychologist_id, slot_time, status, created_at)
	VALUES ($1, $2, $3, $4, $5, NOW())
	RETURNING id`

	var id string

	err := d.conn.QueryRow(ctx, query,
		string(s.ID),             // تبدیل SessionID به string
		string(s.UserID),         // تبدیل UserID به string
		string(s.PsychologistID), // تبدیل PsychologistID به string
		s.SlotTime,               // این معمولاً time.Time است و مستقیم مپ می‌شود
		string(s.Status),         // تبدیل SessionStatus (Enum) به string
	).Scan(&id)

	if err != nil {
		return domain.Session{}, richerror.New(op).WithErr(err).WithMessage("failed to insert sessions")
	}

	s.ID = sessionvalueobject.SessionID(id)

	return s, nil

}

func (d DB) Update(ctx context.Context, s domain.Session) (domain.Session, error) {
	const op = "postgressession.Save"
	panic("up")
}

func (d DB) GetSessionByID(ctx context.Context, id string) (domain.Session, error) {
	const op = "postgressession.Save"
	panic("GetSessionByID")
}
