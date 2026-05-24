package postgrescrisis

import (
	domain "aramina/internal/domain/crisis"
	crisisvalueobject "aramina/internal/domain/crisis/valueobject"
	uservalueobject "aramina/internal/domain/user/valueobject"
	"aramina/internal/pkg/richerror"
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
)

// Save ذخیره بحران جدید
func (d DB) Save(ctx context.Context, crisis *domain.Crisis) error {
	const op = "postgrescrisis.Save"

	// تبدیل Resources به JSON
	resourcesJSON, err := json.Marshal(crisis.Resources)
	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("failed to marshal resources")
	}

	query := `
        INSERT INTO crises (
            id, user_id, level, status, triggered_by, 
            score, message, resources, created_at, 
            resolved_at, follow_up_sent_at, follow_up_count
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `

	_, err = d.conn.Exec(ctx, query,
		string(crisis.ID),
		string(crisis.UserID),
		crisis.Level,
		string(crisis.Status),
		string(crisis.TriggeredBy),
		crisis.Score,
		crisis.Message,
		resourcesJSON,
		crisis.CreatedAt,
		crisis.ResolvedAt,
		crisis.FollowUpSentAt,
		crisis.FollowUpCount,
	)

	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("failed to insert crisis")
	}

	return nil
}

// Update به‌روزرسانی بحران
func (d DB) Update(ctx context.Context, crisis *domain.Crisis) error {
	const op = "postgrescrisis.Update"

	// تبدیل Resources به JSON
	resourcesJSON, err := json.Marshal(crisis.Resources)
	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("failed to marshal resources")
	}

	query := `
        UPDATE crises
        SET level = $2,
            status = $3,
            triggered_by = $4,
            score = $5,
            message = $6,
            resources = $7,
            resolved_at = $8,
            follow_up_sent_at = $9,
            follow_up_count = $10
        WHERE id = $1
    `

	_, err = d.conn.Exec(ctx, query,
		string(crisis.ID),
		crisis.Level,
		string(crisis.Status),
		string(crisis.TriggeredBy),
		crisis.Score,
		crisis.Message,
		resourcesJSON,
		crisis.ResolvedAt,
		crisis.FollowUpSentAt,
		crisis.FollowUpCount,
	)

	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("failed to update crisis")
	}

	return nil
}

// FindByID پیدا کردن بحران با ID
func (d DB) FindByID(ctx context.Context, id crisisvalueobject.CrisisID) (*domain.Crisis, error) {
	const op = "postgrescrisis.FindByID"

	query := `
        SELECT 
            id, user_id, level, status, triggered_by,
            score, message, resources, created_at,
            resolved_at, follow_up_sent_at, follow_up_count
        FROM crises
        WHERE id = $1
    `

	var (
		crisisID       string
		userID         string
		level          int
		status         string
		triggeredBy    string
		score          int
		message        string
		resourcesJSON  []byte
		createdAt      time.Time
		resolvedAt     *time.Time
		followUpSentAt *time.Time
		followUpCount  int
	)

	err := d.conn.QueryRow(ctx, query, string(id)).Scan(
		&crisisID,
		&userID,
		&level,
		&status,
		&triggeredBy,
		&score,
		&message,
		&resourcesJSON,
		&createdAt,
		&resolvedAt,
		&followUpSentAt,
		&followUpCount,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, richerror.New(op).WithMessage("crisis not found")
		}
		return nil, richerror.New(op).WithErr(err).WithMessage("failed to find crisis")
	}

	// تبدیل Resources از JSON
	var resources []crisisvalueobject.CrisisResource
	if resourcesJSON != nil && len(resourcesJSON) > 0 {
		if err := json.Unmarshal(resourcesJSON, &resources); err != nil {
			return nil, richerror.New(op).WithErr(err).WithMessage("failed to unmarshal resources")
		}
	}

	return &domain.Crisis{
		ID:             crisisvalueobject.CrisisID(crisisID),
		UserID:         uservalueobject.UserID(userID),
		Level:          crisisvalueobject.CrisisLevel(level),
		Status:         crisisvalueobject.CrisisStatus(status),
		TriggeredBy:    crisisvalueobject.TriggerType(triggeredBy),
		Score:          score,
		Message:        message,
		Resources:      resources,
		CreatedAt:      createdAt,
		ResolvedAt:     resolvedAt,
		FollowUpSentAt: followUpSentAt,
		FollowUpCount:  followUpCount,
	}, nil
}

// FindActiveByUserID پیدا کردن بحران فعال کاربر (حل نشده)
func (d DB) FindActiveByUserID(ctx context.Context, userID string) (*domain.Crisis, error) {
	const op = "postgrescrisis.FindActiveByUserID"

	query := `
        SELECT 
            id, user_id, level, status, triggered_by,
            score, message, resources, created_at,
            resolved_at, follow_up_sent_at, follow_up_count
        FROM crises
        WHERE user_id = $1 
        AND status != 'resolved'
        ORDER BY created_at DESC
        LIMIT 1
    `

	var (
		crisisID       string
		dbUserID       string
		level          int
		status         string
		triggeredBy    string
		score          int
		message        string
		resourcesJSON  []byte
		createdAt      time.Time
		resolvedAt     *time.Time
		followUpSentAt *time.Time
		followUpCount  int
	)

	err := d.conn.QueryRow(ctx, query, userID).Scan(
		&crisisID,
		&dbUserID,
		&level,
		&status,
		&triggeredBy,
		&score,
		&message,
		&resourcesJSON,
		&createdAt,
		&resolvedAt,
		&followUpSentAt,
		&followUpCount,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil // بدون بحران فعال
		}
		return nil, richerror.New(op).WithErr(err).WithMessage("failed to find active crisis")
	}

	// تبدیل Resources از JSON
	var resources []crisisvalueobject.CrisisResource
	if resourcesJSON != nil && len(resourcesJSON) > 0 {
		if err := json.Unmarshal(resourcesJSON, &resources); err != nil {
			return nil, richerror.New(op).WithErr(err).WithMessage("failed to unmarshal resources")
		}
	}

	return &domain.Crisis{
		ID:             crisisvalueobject.CrisisID(crisisID),
		UserID:         uservalueobject.UserID(dbUserID),
		Level:          crisisvalueobject.CrisisLevel(level),
		Status:         crisisvalueobject.CrisisStatus(status),
		TriggeredBy:    crisisvalueobject.TriggerType(triggeredBy),
		Score:          score,
		Message:        message,
		Resources:      resources,
		CreatedAt:      createdAt,
		ResolvedAt:     resolvedAt,
		FollowUpSentAt: followUpSentAt,
		FollowUpCount:  followUpCount,
	}, nil
}

// FindByUserID پیدا کردن تاریخچه بحران‌های کاربر
func (d DB) FindByUserID(ctx context.Context, userID string, limit, offset int) ([]*domain.Crisis, error) {
	const op = "postgrescrisis.FindByUserID"

	query := `
        SELECT 
            id, user_id, level, status, triggered_by,
            score, message, resources, created_at,
            resolved_at, follow_up_sent_at, follow_up_count
        FROM crises
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
    `

	rows, err := d.conn.Query(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, richerror.New(op).WithErr(err).WithMessage("failed to query crises")
	}
	defer rows.Close()

	var crises []*domain.Crisis

	for rows.Next() {
		var (
			crisisID       string
			dbUserID       string
			level          int
			status         string
			triggeredBy    string
			score          int
			message        string
			resourcesJSON  []byte
			createdAt      time.Time
			resolvedAt     *time.Time
			followUpSentAt *time.Time
			followUpCount  int
		)

		err := rows.Scan(
			&crisisID,
			&dbUserID,
			&level,
			&status,
			&triggeredBy,
			&score,
			&message,
			&resourcesJSON,
			&createdAt,
			&resolvedAt,
			&followUpSentAt,
			&followUpCount,
		)
		if err != nil {
			return nil, richerror.New(op).WithErr(err).WithMessage("failed to scan crisis")
		}

		// تبدیل Resources از JSON
		var resources []crisisvalueobject.CrisisResource
		if resourcesJSON != nil && len(resourcesJSON) > 0 {
			if err := json.Unmarshal(resourcesJSON, &resources); err != nil {
				return nil, richerror.New(op).WithErr(err).WithMessage("failed to unmarshal resources")
			}
		}

		crises = append(crises, &domain.Crisis{
			ID:             crisisvalueobject.CrisisID(crisisID),
			UserID:         uservalueobject.UserID(dbUserID),
			Level:          crisisvalueobject.CrisisLevel(level),
			Status:         crisisvalueobject.CrisisStatus(status),
			TriggeredBy:    crisisvalueobject.TriggerType(triggeredBy),
			Score:          score,
			Message:        message,
			Resources:      resources,
			CreatedAt:      createdAt,
			ResolvedAt:     resolvedAt,
			FollowUpSentAt: followUpSentAt,
			FollowUpCount:  followUpCount,
		})
	}

	if err = rows.Err(); err != nil {
		return nil, richerror.New(op).WithErr(err).WithMessage("rows iteration error")
	}

	return crises, nil
}
