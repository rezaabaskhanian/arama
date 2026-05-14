package postgresexercise

import (
	domain "aramina/internal/domain/exercise"
	exercisevalueobject "aramina/internal/domain/exercise/valueobject"
	"aramina/internal/pkg/richerror"
	"context"
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

	ex.ID = exercisevalueobject.EexrciseID(id)

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
	WHERE trauma_type = $1 AND is_active = true
	ORDER BY order_index ASC
`

	rows, err := e.conn.Query(ctx, query, traumaType)

	if err != nil {
		return []domain.Exercise{}, richerror.New(op).WithErr(err).WithMessage("failed to insert sessions")
	}

	defer rows.Close()

	var exercises []domain.Exercise

	for rows.Next() {
		var ex domain.Exercise
		err := rows.Scan(
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
			return nil, richerror.New(op).WithErr(err).WithMessage("failed to scan exercise")
		}
		exercises = append(exercises, ex)
	}

	if err = rows.Err(); err != nil {
		return nil, richerror.New(op).WithErr(err).WithMessage("rows iteration error")
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

func (e DB) CountTotalExercies(ctx context.Context) (int, error) {
	const op = "postgresexercise.CountTotalExercies"
	query := `
       SELECT COUNT(*) FROM exercises WHERE is_active = true
    `
	var count int
	err := e.conn.QueryRow(ctx, query).Scan(&count)
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
