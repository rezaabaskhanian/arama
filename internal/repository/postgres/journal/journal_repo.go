package postgresjournal

import (
	domain "aramina/internal/domain/journal"
	journalvalueobject "aramina/internal/domain/journal/valueobject"
	"errors"
	"time"

	"aramina/internal/pkg/richerror"
	"context"

	"github.com/jackc/pgx/v5"
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

func (d DB) FindByUserID(ctx context.Context, userID string, limit, offset int) ([]domain.Journal, error) {
	const op = "postgresjournal.FindByUserID"

	var journal []domain.Journal

	query := `
		SELECT 
			id, 
			user_id, 
			content, 
			mood, 
			created_at, 
			updated_at
		FROM journals
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
		`

	rows, err := d.conn.Query(ctx, query)

	if err != nil {
		return []domain.Journal{}, richerror.New(op).WithErr(err).WithMessage("failed to get journals")
	}

	defer rows.Close()

	for rows.Next() {
		var jo domain.Journal

		err := rows.Scan(
			&jo.ID,
			&jo.UserID,
			&jo.Content,
			&jo.Mood,
			&jo.CreatedAt,
			&jo.UpdatedAt,
		)

		if err != nil {
			return []domain.Journal{}, richerror.New(op).WithErr(err)
		}

		journal = append(journal, jo)

	}

	if err = rows.Err(); err != nil {
		return nil, richerror.New(op).WithErr(err).WithMessage("rows iteration error")
	}

	return journal, nil

}

func (d DB) Update(ctx context.Context, journal domain.Journal) error {
	const op = "postgresjournal.Update"

	query := `update journals SET content =$2,mod =$3, updated_at = $4 WHERE id = $1 AND user_id =$5`

	_, err := d.conn.Exec(ctx, query,
		journal.ID,
		journal.Content,
		journal.Mood,
		journal.UpdatedAt,
		journal.UserID,
	)

	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("failed to update journal")
	}

	return nil

}

func (d DB) FindByID(ctx context.Context, id string, userID string) (domain.Journal, error) {
	const op = "postgresjournal.FindByID"

	query := `SELECT id,user_id,content,mod,created_at,updated_at FROM journals WHERE id =$1 AND user_id =$2`

	var journal domain.Journal

	err := d.conn.QueryRow(ctx, query, id, userID).Scan(
		&journal.ID,
		&journal.UserID,
		&journal.Content,
		&journal.Mood,
		&journal.CreatedAt,
		&journal.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Journal{}, richerror.New(op).WithMessage("یادداشت یافت نشد")
		}
		return domain.Journal{}, richerror.New(op).WithErr(err).WithMessage("خطا در دریافت یادداشت")
	}

	return journal, nil

}

func (d DB) Delete(ctx context.Context, id string) error {
	const op = "postgresjournal.Delete"

	query := `DELETE FROM journals WHERE id =$1`

	cmd, err := d.conn.Exec(context.Background(), query, id)

	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("faild to delete journal")
	}
	if cmd.RowsAffected() == 0 {
		return richerror.New(op).WithErr(err).WithMessage("faild to find row journal")
	}

	return nil
}
