package postgresexercise

import (
	assessmentvalueobject "aramina/internal/domain/assessment/valueobject"
	domain "aramina/internal/domain/exercise"
	exercisevalueobject "aramina/internal/domain/exercise/valueobject"
	"aramina/internal/pkg/richerror"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
)

func (e DB) SaveExercise(ctx context.Context, ex domain.Exercise) (domain.Exercise, error) {
	const op = "postgresexercise.SaveExercise"

	query := `
	INSERT INTO exercises (
		id, 
		title, 
		description, 
		trauma_type, 
		media_url, 
		duration, 
		order_index, 
		is_active, 
		created_at
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
`

	var id string

	err := e.conn.QueryRow(ctx, query,
		ex.ID,
		ex.Title,
		ex.Description,
		string(ex.TraumaType),
		ex.MediaURL,
		ex.Duration,
		ex.Order,
		ex.IsActive,
	).Scan(&id)

	if err != nil {
		return domain.Exercise{}, richerror.New(op).WithErr(err).WithMessage("failed to insert sessions")
	}

	ex.ID = exercisevalueobject.ExerciseID(id)

	return ex, nil

}

func (e DB) SaveUserExercise(ctx context.Context, userID, exerciseID string) error {
	const op = "postgresexercise.SaveUserExercise"

	query := `
	INSERT INTO user_exercises (user_id, exercise_id, completed_at )
	VALUES ($1, $2 ,NOW())
	ON CONFLICT (user_id, exercise_id) DO NOTHING
`

	_, err := e.conn.Exec(ctx, query, userID, exerciseID)

	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("failed to save user exercise")
	}

	return nil

}

func (e DB) FindExercisesByTraumaType(ctx context.Context, traumaType string) ([]domain.Exercise, error) {
	const op = "postgresexercise.FindExercisesByTraumaType"

	// query := `
	// SELECT
	//     id, title, description, trauma_type, media_url,
	//     duration, order_index, is_active, created_at
	// FROM exercises
	// WHERE trauma_type = $1 AND is_active = true
	// ORDER BY order_index ASC
	// `
	query := `
    SELECT 
        id, title, description, trauma_type, media_url, 
        duration, order_index, is_active, created_at
    FROM exercises
    WHERE trauma_type = $1 AND is_active = true
    ORDER BY order_index ASC
    `

	rows, err := e.conn.Query(ctx, query, traumaType)
	fmt.Printf("rows: %v, err: %v\n", rows, err)
	if err != nil {
		return nil, richerror.New(op).WithErr(err)
	}
	defer rows.Close()

	var exercises []domain.Exercise

	for rows.Next() {

		var ex domain.Exercise
		var idStr string
		var traumaTypeStr string

		err := rows.Scan(
			&idStr,
			&ex.Title,
			&ex.Description,
			&traumaTypeStr,
			&ex.MediaURL,
			&ex.Duration,
			&ex.Order,
			&ex.IsActive,
			&ex.CreatedAt,
		)
		if err != nil {

			return nil, richerror.New(op).WithErr(err)
		}

		ex.ID, err = exercisevalueobject.ParseExerciseID(idStr)
		if err != nil {
			return nil, err
		}
		ex.TraumaType = assessmentvalueobject.TraumaType(traumaTypeStr)

		exercises = append(exercises, ex)
	}

	return exercises, nil
}

func (e DB) FindExerciseByID(ctx context.Context, id string) (domain.Exercise, error) {
	const op = "postgresexercise.FindExerciseByID"

	query := `
        SELECT 
            id, 
            title, 
            description, 
            trauma_type, 
            media_url, 
            duration, 
            order_index, 
            is_active, 
            created_at
        FROM exercises
        WHERE id = $1 AND is_active = true
    `

	var ex domain.Exercise

	err := e.conn.QueryRow(ctx, query, id).Scan(
		&ex.ID,
		&ex.Title,
		&ex.Description,
		&ex.TraumaType,
		&ex.MediaURL,
		&ex.Duration,
		&ex.Order,
		&ex.IsActive,
		&ex.CreatedAt,
	)

	if err != nil {
		return domain.Exercise{}, richerror.New(op).WithErr(err).WithMessage("failed to find exercise")
	}

	return ex, nil
}

func (e DB) CountTotalExercies(ctx context.Context, traumaType string) (int, error) {
	const op = "postgresexercise.CountTotalExercies"
	// query := `
	//    SELECT COUNT(*) FROM exercises WHERE is_active = true
	// `
	query := `SELECT COUNT(*) FROM exercises WHERE trauma_type = $1 AND is_active = true`
	var count int
	err := e.conn.QueryRow(ctx, query, traumaType).Scan(&count)
	return count, err
}

func (e DB) CountUserCompletedExercises(ctx context.Context, userID string) (int, error) {
	const op = "postgresexercise.CountUserCompletedExercises"

	query := `SELECT COUNT(*) FROM user_exercises WHERE user_id = $1`
	var count int
	err := e.conn.QueryRow(ctx, query, userID).Scan(&count)
	return count, err
}

func (e DB) IsExerciseCompletedByUser(ctx context.Context, userID string, exerciseID string) (bool, error) {
	const op = "postgresexercise.IsExerciseCompletedByUser"

	query := `SELECT EXISTS(SELECT 1 FROM user_exercises WHERE user_id = $1 AND exercise_id = $2)`

	var exists bool
	err := e.conn.QueryRow(ctx, query, userID, exerciseID).Scan(&exists)
	if err != nil {
		return false, richerror.New(op).WithErr(err).WithMessage("failed to check exercise completion")
	}

	return exists, nil
}

// internal/repository/postgres/exercise/repo.go

func (d DB) GetLastUserExerciseDate(ctx context.Context, userID string) (*time.Time, error) {
	const op = "postgresexercise.GetLastUserExerciseDate"

	query := `
        SELECT completed_at
        FROM user_exercises
        WHERE user_id = $1
        ORDER BY completed_at DESC
        LIMIT 1
    `

	var lastDate time.Time
	err := d.conn.QueryRow(ctx, query, userID).Scan(&lastDate)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil // هیچ تمرینی انجام نداده
		}
		return nil, richerror.New(op).WithErr(err).WithMessage("failed to get last exercise date")
	}

	return &lastDate, nil
}

// FindAll پیدا کردن همه تمرین‌ها (با قابلیت فیلتر isActive)
func (d DB) FindAll(ctx context.Context, isActive *bool) ([]domain.Exercise, error) {
	const op = "postgresexercise.FindAll"

	query := `
        SELECT 
            id, title, description, trauma_type, media_url, 
            duration, order_index, is_active, created_at, updated_at
        FROM exercises
        WHERE 1=1
    `
	args := []interface{}{}
	argIndex := 1

	if isActive != nil {
		query += fmt.Sprintf(" AND is_active = $%d", argIndex)
		args = append(args, *isActive)
		argIndex++
	}

	query += ` ORDER BY order_index ASC`

	rows, err := d.conn.Query(ctx, query, args...)
	if err != nil {
		return nil, richerror.New(op).WithErr(err).WithMessage("failed to query exercises")
	}
	defer rows.Close()

	var exercises []domain.Exercise

	for rows.Next() {
		var ex domain.Exercise
		var idStr string
		var traumaTypeStr string
		var mediaURL sql.NullString

		err := rows.Scan(
			&idStr,
			&ex.Title,
			&ex.Description,
			&traumaTypeStr,
			&mediaURL,
			&ex.Duration,
			&ex.Order,
			&ex.IsActive,
			&ex.CreatedAt,
			&ex.UpdatedAt,
		)
		if err != nil {
			return nil, richerror.New(op).WithErr(err).WithMessage("failed to scan exercise")
		}

		ex.ID = exercisevalueobject.ExerciseID(idStr)
		ex.TraumaType = assessmentvalueobject.TraumaType(traumaTypeStr)
		if mediaURL.Valid {
			ex.MediaURL = mediaURL.String
		}

		exercises = append(exercises, ex)
	}

	return exercises, nil
}

// CountAll تعداد کل تمرین‌ها
func (d DB) CountAll(ctx context.Context) (int, error) {
	const op = "postgresexercise.CountAll"

	query := `SELECT COUNT(*) FROM exercises`

	var count int
	err := d.conn.QueryRow(ctx, query).Scan(&count)
	if err != nil {
		return 0, richerror.New(op).WithErr(err).WithMessage("failed to count exercises")
	}

	return count, nil
}
