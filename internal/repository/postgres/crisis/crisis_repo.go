package postgrescrisis

import (
	domain "aramina/internal/domain/crisis"
	crisisvalueobject "aramina/internal/domain/crisis/valueobject"
	"aramina/internal/pkg/errmesg"
	"aramina/internal/pkg/richerror"
	"context"
	"database/sql"
	"fmt"

	"github.com/jackc/pgx/v5"
)

func (r DB) Save(c domain.Crisis) (domain.Crisis, error) {

	const op = "postgrescrisis.Save"

	query := `INSERT INTO crisis (
    id, user_id, current_step,risk_level,started_at , result
) VALUES ($1, $2, $3, $4,now() ,$5)
RETURNING id;`

	var id string
	err := r.conn.QueryRow(
		context.Background(),
		query,
		string(c.ID),
		c.UserID, // pgx از pointer به UUID پشتیبانی می‌کند
		c.CurrentStep,
		c.RiskLevel,
		c.Result,
	).Scan(&id)

	if err != nil {
		return domain.Crisis{}, richerror.New(op).WithErr(err).WithMessage("failed to insert crisis")
	}

	c.ID = crisisvalueobject.CrisisID(id)

	return c, nil

}

func (r DB) GetByID(id crisisvalueobject.CrisisID) (domain.Crisis, error) {
	const op = "postgrescrisis.GetByID"
	const query = `
        SELECT  id, user_id, current_step,risk_level,started_at,completed_at, result
        FROM crisis
        WHERE id = $1`
	var (
		c         domain.Crisis
		idStr     string
		userIDStr sql.NullString
	)

	// دریافت مقادیر از دیتابیس
	err := r.conn.QueryRow(context.Background(), query, string(id)).Scan(
		&idStr,
		&userIDStr,
		&c.CurrentStep,
		&c.RiskLevel,
		&c.StartedAt,
		&c.CompletedAt,
		&c.Result,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return domain.Crisis{}, richerror.New(op).
				WithErr(err).
				WithMessage(errmesg.ErrorMsgCantScanQueryResult).
				WithKind(richerror.KindUnexpected)
		}
		return domain.Crisis{}, err
	}
	c.ID = crisisvalueobject.CrisisID(idStr)
	if userIDStr.Valid {
		uid := crisisvalueobject.UserID(userIDStr.String)
		c.UserID = &uid
	} else {
		c.UserID = nil
	}
	return c, nil
}

func (r DB) Delete(id crisisvalueobject.CrisisID) error {
	const op = "postgrescrisis.Delete"

	const query = `
        DELETE FROM crisis
        WHERE id = $1
    `

	ctx := context.Background()

	cmd, err := r.conn.Exec(ctx, query, string(id))
	if err != nil {
		return fmt.Errorf("delete crisis %s: %w", id, err)
	}

	if cmd.RowsAffected() == 0 {
		return fmt.Errorf("crisis %s not found", id)
	}

	return nil
}
