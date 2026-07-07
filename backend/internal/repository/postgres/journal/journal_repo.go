package postgresjournal

import (
	domain "aramina/internal/domain/journal"
	journalvalueobject "aramina/internal/domain/journal/valueobject"
	"errors"
	"fmt"
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

	fmt.Println(s, "errrreeee")

	var id string

	err := d.conn.QueryRow(ctx, query,
		string(s.ID),     // تبدیل SessionID به string
		string(s.UserID), // تبدیل UserID به string
		s.Content,
		s.Mood,
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
        FROM journals
        WHERE user_id = $1
        AND created_at >= $2
        AND created_at < $3
    `

	err := d.conn.QueryRow(ctx, query, userID, startOfDay, endOfDay).Scan(&count)
	if err != nil {
		return 0, richerror.New(op).WithErr(err).WithMessage("failed to count today entries")
	}
	return count, nil
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

	rows, err := d.conn.Query(ctx, query, userID, limit, offset)

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

	query := `
        UPDATE journals 
        SET content = $2, mood = $3, updated_at = NOW()
        WHERE id = $1 AND user_id = $4
    `

	// fmt.Printf("🔍 Query: %s\n", query)
	// fmt.Printf("🔍 Params: id=%s, content=%s, mood=%d, user_id=%s\n",
	//     string(journal.ID),
	//     journal.Content,
	//     journal.Mood,
	//     string(journal.UserID),
	// )

	result, err := d.conn.Exec(ctx, query,
		string(journal.ID),
		journal.Content,
		journal.Mood,
		string(journal.UserID),
	)
	if err != nil {
		// fmt.Printf("❌ Exec error: %v\n", err)
		return richerror.New(op).WithErr(err).WithMessage("failed to update journal")
	}

	rowsAffected := result.RowsAffected()
	// fmt.Printf("✅ Rows affected: %d\n", rowsAffected)

	if rowsAffected == 0 {
		return richerror.New(op).WithMessage("هیچ رکوردی به‌روزرسانی نشد")
	}

	return nil
}

func (d DB) FindByID(ctx context.Context, id string, userID string) (domain.Journal, error) {
	const op = "postgresjournal.FindByID"

	query := `SELECT id,user_id,content,mood,created_at,updated_at FROM journals WHERE id =$1 AND user_id =$2`

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

func (d DB) GetMoodByDateRange(ctx context.Context, userID string, start, end time.Time) (int, error) {

	const op = "postgresjournal.GetMoodByDateRange"

	query := `SELECT mood 
	 FROM journal_moods  WHERE user_id =$1 
	AND created_at >=$2 AND created_at <$3
	ORDER BY created_at DESC LIMIT 1`

	var mood int
	err := d.conn.QueryRow(ctx, query, userID, start, end).Scan(&mood)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return 0, errors.New("مود امروز یافت نشد")
		}
		return 0, err
	}
	return mood, nil

}

func (d DB) UpsertTodayMood(ctx context.Context, userID string, mood int) error {
	const op = "postgresjournal.UpsertTodayMood"

	query := `
        INSERT INTO journal_moods (id, user_id, mood, date, created_at)
        VALUES (gen_random_uuid(), $1, $2, CURRENT_DATE, NOW())
        ON CONFLICT (user_id, date) 
        DO UPDATE SET mood = $2, updated_at = NOW()
    `

	_, err := d.conn.Exec(ctx, query, userID, mood)
	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("خطا در ذخیره مود امروز")
	}

	return nil
}

//چک میکنه امروز. مود صبت کرده یا نه

func (d DB) GetCurrentStreak(ctx context.Context, userID string) (int, error) {
	const op = "postgresjournal.GetCurrentStreak"

	// فقط چک کن امروز مود ثبت شده؟
	var exists bool
	checkQuery := `
        SELECT EXISTS(
            SELECT 1 FROM journal_moods 
            WHERE user_id = $1 AND date = CURRENT_DATE
        )
    `
	err := d.conn.QueryRow(ctx, checkQuery, userID).Scan(&exists)
	if err != nil {
		return 0, richerror.New(op).WithErr(err)
	}

	if !exists {
		return 0, nil
	}

	// اگر امروز ثبت شده، تعداد روزهای متوالی را بشمار
	query := `
        WITH RECURSIVE streak_days AS (
            SELECT date, 1 as streak
            FROM journal_moods
            WHERE user_id = $1 AND date = CURRENT_DATE
            
            UNION ALL
            
            SELECT jm.date, sd.streak + 1
            FROM journal_moods jm
            INNER JOIN streak_days sd ON jm.date = sd.date - INTERVAL '1 day'
            WHERE jm.user_id = $1
        )
        SELECT MAX(streak) FROM streak_days
    `

	var streak int
	err = d.conn.QueryRow(ctx, query, userID).Scan(&streak)
	if err != nil {
		return 0, richerror.New(op).WithErr(err)
	}

	return streak, nil
}

func (d DB) CountByUserID(ctx context.Context, userID string) (int, error) {
	const op = "postgresjournal.CountByUserID"

	query := `SELECT COUNT(*) FROM journals WHERE user_id = $1`

	var count int
	err := d.conn.QueryRow(ctx, query, userID).Scan(&count)
	if err != nil {
		return 0, richerror.New(op).WithErr(err).WithMessage("failed to count journals")
	}

	return count, nil
}

func (d DB) GetRecentMoods(ctx context.Context, userID string, days int) ([]int, error) {
	const op = "postgresjournal.GetRecentMoods"

	query := `
        SELECT mood
        FROM journal_moods
        WHERE user_id = $1
        ORDER BY date DESC
        LIMIT $2
    `

	rows, err := d.conn.Query(ctx, query, userID, days)
	if err != nil {
		return nil, richerror.New(op).WithErr(err).WithMessage("failed to get recent moods")
	}
	defer rows.Close()

	var moods []int
	for rows.Next() {
		var mood int
		if err := rows.Scan(&mood); err != nil {
			return nil, richerror.New(op).WithErr(err)
		}
		moods = append(moods, mood)
	}

	return moods, nil
}

// internal/repository/postgres/journal/repo.go

func (d DB) GetLatestJournalContent(ctx context.Context, userID string) (string, error) {
	const op = "postgresjournal.GetLatestJournalContent"

	query := `
        SELECT content
        FROM journals
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1
    `

	var content string
	err := d.conn.QueryRow(ctx, query, userID).Scan(&content)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", nil // بدون یادداشت
		}
		return "", richerror.New(op).WithErr(err).WithMessage("failed to get latest journal")
	}

	return content, nil
}
