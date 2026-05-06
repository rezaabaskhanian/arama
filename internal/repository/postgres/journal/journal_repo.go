package postgresjournal

import (
	domain "aramina/internal/domain/journal"
	journalvalueobject "aramina/internal/domain/journal/valueobject"
	"time"

	"aramina/internal/pkg/richerror"
	"context"
)

func (d DB) Save(ctx context.Context, s domain.Journal) (domain.Journal, error) {
	const op = "postgresjournal.Save"

	query := `
	INSERT INTO journals (id, user_id, content, mood , created_at)
	VALUES ($1, $2, $3, $4, NOW())
	RETURNING id`

	var id string

	err := d.conn.QueryRow(ctx, query,
		string(s.ID),     // تبدیل SessionID به string
		string(s.UserID), // تبدیل UserID به string
		s.Content,
		s.Mood,
		s.CreatedAt,
	).Scan(&id)

	if err != nil {
		return domain.Journal{}, richerror.New(op).WithErr(err).WithMessage("failed to insert journals")
	}

	s.ID = journalvalueobject.JournalID(id)

	return s, nil

}

func (d DB) CountTodayEntries(ctx context.Context, userID string) (int, error) {
	const op = "postgresjournal.CountTodayEntries"
	var count int

	today := time.Now()
	startOfDay := time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, today.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	query := `
        SELECT COUNT(*)
        FROM journal_entries
        WHERE user_id = $1
        AND created_at >= $2
        AND created_at < $3
    `

	err := d.conn.QueryRow(ctx, query, userID, startOfDay, endOfDay).Scan(&count)
	return count, richerror.New(op).WithErr(err).WithMessage("failed to insert time journal")
}
