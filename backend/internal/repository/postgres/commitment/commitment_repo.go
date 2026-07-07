package postgrescommitment

import (
	domain "aramina/internal/domain/commitment"
	vo "aramina/internal/domain/commitment/valueobject"
	uservalueobject "aramina/internal/domain/user/valueobject"
	"aramina/internal/pkg/richerror"
	"context"
)

func (d DB) ListActiveTemplates(ctx context.Context) ([]domain.CommitmentTemplate, error) {
	const op = "postgrescommitment.ListActiveTemplates"

	query := `
		SELECT id, title, description, category, icon, duration_hint, is_active, order_index
		FROM commitment_templates
		WHERE is_active = true
		ORDER BY order_index ASC`

	rows, err := d.conn.Query(ctx, query)
	if err != nil {
		return nil, richerror.New(op).WithErr(err).WithMessage("failed to query templates")
	}
	defer rows.Close()

	var out []domain.CommitmentTemplate
	for rows.Next() {
		var t domain.CommitmentTemplate
		var id, category string
		if err := rows.Scan(&id, &t.Title, &t.Description, &category, &t.Icon, &t.DurationHint, &t.IsActive, &t.OrderIndex); err != nil {
			return nil, richerror.New(op).WithErr(err).WithMessage("failed to scan template")
		}
		t.ID = vo.CommitmentID(id)
		t.Category = vo.Category(category)
		out = append(out, t)
	}
	return out, nil
}

func (d DB) GetTemplateByID(ctx context.Context, id string) (domain.CommitmentTemplate, error) {
	const op = "postgrescommitment.GetTemplateByID"

	query := `
		SELECT id, title, description, category, icon, duration_hint, is_active, order_index
		FROM commitment_templates
		WHERE id = $1`

	var t domain.CommitmentTemplate
	var tid, category string
	err := d.conn.QueryRow(ctx, query, id).Scan(
		&tid, &t.Title, &t.Description, &category, &t.Icon, &t.DurationHint, &t.IsActive, &t.OrderIndex,
	)
	if err != nil {
		return domain.CommitmentTemplate{}, richerror.New(op).WithErr(err).WithMessage("template not found")
	}
	t.ID = vo.CommitmentID(tid)
	t.Category = vo.Category(category)
	return t, nil
}

func (d DB) SaveUserCommitment(ctx context.Context, uc domain.UserCommitment) (domain.UserCommitment, error) {
	const op = "postgrescommitment.SaveUserCommitment"

	query := `
		INSERT INTO user_commitments
			(id, user_id, template_id, title, category, status, mood_before, mood_after, reflection, pledged_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id`

	var templateID interface{}
	if uc.TemplateID != "" {
		templateID = uc.TemplateID
	}

	var id string
	err := d.conn.QueryRow(ctx, query,
		string(uc.ID),
		string(uc.UserID),
		templateID,
		uc.Title,
		string(uc.Category),
		string(uc.Status),
		uc.MoodBefore,
		uc.MoodAfter,
		uc.Reflection,
		uc.PledgedAt,
	).Scan(&id)
	if err != nil {
		return domain.UserCommitment{}, richerror.New(op).WithErr(err).WithMessage("failed to insert commitment")
	}
	uc.ID = vo.CommitmentID(id)
	return uc, nil
}

func (d DB) UpdateUserCommitment(ctx context.Context, uc domain.UserCommitment) error {
	const op = "postgrescommitment.UpdateUserCommitment"

	query := `
		UPDATE user_commitments
		SET status = $1, mood_before = $2, mood_after = $3, reflection = $4, completed_at = $5
		WHERE id = $6 AND user_id = $7`

	_, err := d.conn.Exec(ctx, query,
		string(uc.Status),
		uc.MoodBefore,
		uc.MoodAfter,
		uc.Reflection,
		uc.CompletedAt,
		string(uc.ID),
		string(uc.UserID),
	)
	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("failed to update commitment")
	}
	return nil
}

func (d DB) GetUserCommitmentByID(ctx context.Context, id string, userID string) (domain.UserCommitment, error) {
	const op = "postgrescommitment.GetUserCommitmentByID"

	query := `
		SELECT id, user_id, COALESCE(template_id::text, ''), title, category, status,
		       mood_before, mood_after, reflection, pledged_at, completed_at
		FROM user_commitments
		WHERE id = $1 AND user_id = $2`

	return scanUserCommitment(d.conn.QueryRow(ctx, query, id, userID))
}

func (d DB) ListUserCommitments(ctx context.Context, userID string) ([]domain.UserCommitment, error) {
	const op = "postgrescommitment.ListUserCommitments"

	query := `
		SELECT id, user_id, COALESCE(template_id::text, ''), title, category, status,
		       mood_before, mood_after, reflection, pledged_at, completed_at
		FROM user_commitments
		WHERE user_id = $1
		ORDER BY pledged_at DESC`

	rows, err := d.conn.Query(ctx, query, userID)
	if err != nil {
		return nil, richerror.New(op).WithErr(err).WithMessage("failed to query commitments")
	}
	defer rows.Close()

	var out []domain.UserCommitment
	for rows.Next() {
		uc, err := scanUserCommitment(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, uc)
	}
	return out, nil
}

// rowScanner اینترفیس مشترک بین Row و Rows برای Scan
type rowScanner interface {
	Scan(dest ...interface{}) error
}

func scanUserCommitment(row rowScanner) (domain.UserCommitment, error) {
	const op = "postgrescommitment.scanUserCommitment"

	var uc domain.UserCommitment
	var id, uid, category, status string
	err := row.Scan(
		&id, &uid, &uc.TemplateID, &uc.Title, &category, &status,
		&uc.MoodBefore, &uc.MoodAfter, &uc.Reflection, &uc.PledgedAt, &uc.CompletedAt,
	)
	if err != nil {
		return domain.UserCommitment{}, richerror.New(op).WithErr(err).WithMessage("failed to scan commitment")
	}
	uc.ID = vo.CommitmentID(id)
	uc.UserID = uservalueobject.UserID(uid)
	uc.Category = vo.Category(category)
	uc.Status = vo.Status(status)
	return uc, nil
}

// ---- متدهای مدیریت الگوها (ادمین) ----

func (d DB) ListAllTemplates(ctx context.Context) ([]domain.CommitmentTemplate, error) {
	const op = "postgrescommitment.ListAllTemplates"

	query := `
		SELECT id, title, description, category, icon, duration_hint, is_active, order_index
		FROM commitment_templates
		ORDER BY order_index ASC`

	rows, err := d.conn.Query(ctx, query)
	if err != nil {
		return nil, richerror.New(op).WithErr(err).WithMessage("failed to query templates")
	}
	defer rows.Close()

	var out []domain.CommitmentTemplate
	for rows.Next() {
		var t domain.CommitmentTemplate
		var id, category string
		if err := rows.Scan(&id, &t.Title, &t.Description, &category, &t.Icon, &t.DurationHint, &t.IsActive, &t.OrderIndex); err != nil {
			return nil, richerror.New(op).WithErr(err).WithMessage("failed to scan template")
		}
		t.ID = vo.CommitmentID(id)
		t.Category = vo.Category(category)
		out = append(out, t)
	}
	return out, nil
}

func (d DB) CreateTemplate(ctx context.Context, t domain.CommitmentTemplate) (domain.CommitmentTemplate, error) {
	const op = "postgrescommitment.CreateTemplate"

	query := `
		INSERT INTO commitment_templates
			(id, title, description, category, icon, duration_hint, is_active, order_index, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id`

	var id string
	err := d.conn.QueryRow(ctx, query,
		string(t.ID), t.Title, t.Description, string(t.Category), t.Icon,
		t.DurationHint, t.IsActive, t.OrderIndex, t.CreatedAt, t.UpdatedAt,
	).Scan(&id)
	if err != nil {
		return domain.CommitmentTemplate{}, richerror.New(op).WithErr(err).WithMessage("failed to create template")
	}
	t.ID = vo.CommitmentID(id)
	return t, nil
}

func (d DB) UpdateTemplate(ctx context.Context, t domain.CommitmentTemplate) error {
	const op = "postgrescommitment.UpdateTemplate"

	query := `
		UPDATE commitment_templates
		SET title = $1, description = $2, category = $3, icon = $4,
		    duration_hint = $5, is_active = $6, order_index = $7, updated_at = $8
		WHERE id = $9`

	_, err := d.conn.Exec(ctx, query,
		t.Title, t.Description, string(t.Category), t.Icon,
		t.DurationHint, t.IsActive, t.OrderIndex, t.UpdatedAt, string(t.ID),
	)
	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("failed to update template")
	}
	return nil
}

func (d DB) DeleteTemplate(ctx context.Context, id string) error {
	const op = "postgrescommitment.DeleteTemplate"
	_, err := d.conn.Exec(ctx, `DELETE FROM commitment_templates WHERE id = $1`, id)
	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("failed to delete template")
	}
	return nil
}

func (d DB) CountTemplates(ctx context.Context) (int, error) {
	const op = "postgrescommitment.CountTemplates"
	var count int
	err := d.conn.QueryRow(ctx, `SELECT COUNT(*) FROM commitment_templates`).Scan(&count)
	if err != nil {
		return 0, richerror.New(op).WithErr(err).WithMessage("failed to count templates")
	}
	return count, nil
}
