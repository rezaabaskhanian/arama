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

func (e DB) SaveUserExercise(ctx context.Context, userExerciseID string) (domain.UserExercise, error) {
	panic("test")

}
