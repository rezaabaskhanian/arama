package postgresassessment

import (
	domain "aramina/internal/domain/assessment"
	assessmentvalueobject "aramina/internal/domain/assessment/valueobject"
	uservalueobject "aramina/internal/domain/user/valueobject"
	"encoding/json"
	"errors"
	"time"

	"aramina/internal/pkg/richerror"
	"context"

	"github.com/jackc/pgx/v5"
)

func (d DB) Save(ctx context.Context, j domain.Assessment) error {
	const op = "postgresassessment.Save"

	query := `
	INSERT INTO assessments (
		id, 
		user_id, 
		status, 
		answers, 
		total_score, 
		trauma_type, 
		started_at, 
		completed_at
	)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

	answersJSON, err := json.Marshal(j.Answers)
	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("failed to marshal answers")
	}

	_, err = d.conn.Exec(ctx, query,
		string(j.ID),
		j.UserID,
		string(j.Status),
		answersJSON,
		j.TotalScore,
		string(j.TraumaType),
		j.StartedAt,
		j.CompletedAt,
	)

	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("failed to insert assessment")
	}

	return nil
}

// Update به‌روزرسانی یک ارزیابی
func (d DB) Update(ctx context.Context, j domain.Assessment) error {
	const op = "postgresassessment.Update"

	// تبدیل Answers به JSON برای ذخیره در دیتابیس
	answersJSON, err := json.Marshal(j.Answers)
	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("failed to marshal answers")
	}

	query := `
	UPDATE assessments
	SET
		status = $2,
		answers = $3,
		total_score = $4,
		trauma_type = $5,
		completed_at = $6
	WHERE id = $1`

	_, err = d.conn.Exec(ctx, query,
		string(j.ID),
		string(j.Status),
		answersJSON,
		j.TotalScore,
		string(j.TraumaType),
		j.CompletedAt,
	)

	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("failed to update assessment")
	}

	return nil
}

// FindByID پیدا کردن ارزیابی با ID
func (d DB) FindByID(ctx context.Context, id string) (domain.Assessment, error) {
	const op = "postgresassessment.FindByID"

	query := `
	SELECT
		id, user_id, status, answers, total_score, trauma_type, started_at, completed_at
	FROM assessments
	WHERE id = $1`

	var (
		assessmentID string
		userID       string
		status       string
		answersJSON  []byte
		totalScore   int
		traumaType   string
		startedAt    time.Time
		completedAt  *time.Time
	)

	err := d.conn.QueryRow(ctx, query, string(id)).Scan(
		&assessmentID,
		&userID,
		&status,
		&answersJSON,
		&totalScore,
		&traumaType,
		&startedAt,
		&completedAt,
	)
	if err != nil {
		return domain.Assessment{}, richerror.New(op).WithErr(err).WithMessage("failed to find assessment")
	}

	// تبدیل Answers از JSON
	var answers []domain.Answer
	if err := json.Unmarshal(answersJSON, &answers); err != nil {
		return domain.Assessment{}, richerror.New(op).WithErr(err).WithMessage("failed to unmarshal answers")
	}

	// ساخت ارزیابی

	return domain.Assessment{
		ID:          assessmentvalueobject.AssessmentID(assessmentID),
		UserID:      uservalueobject.UserID(userID),
		Status:      assessmentvalueobject.AssessmentStatus(status),
		Answers:     answers,
		TotalScore:  totalScore,
		TraumaType:  assessmentvalueobject.TraumaType(traumaType),
		StartedAt:   startedAt,
		CompletedAt: completedAt,
	}, nil
}

func (d DB) LatestAssessment(ctx context.Context, userID string) (domain.Assessment, error) {
	const op = "postgresassessment.LatestAssessment"

	query := `
        SELECT
            id, user_id, status, answers, total_score, trauma_type, started_at, completed_at
        FROM assessments
        WHERE user_id = $1
        ORDER BY started_at DESC
        LIMIT 1`

	var (
		assessmentID string
		dbUserID     string
		status       string
		answersJSON  []byte
		totalScore   int
		traumaType   string
		startedAt    time.Time
		completedAt  *time.Time
	)

	err := d.conn.QueryRow(ctx, query, userID).Scan(
		&assessmentID,
		&dbUserID,
		&status,
		&answersJSON,
		&totalScore,
		&traumaType,
		&startedAt,
		&completedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Assessment{}, richerror.New(op).WithMessage("هیچ تستی یافت نشد")
		}
		return domain.Assessment{}, richerror.New(op).WithErr(err).WithMessage("failed to find latest assessment")
	}

	// تبدیل Answers از JSON
	var answers []domain.Answer
	if answersJSON != nil && len(answersJSON) > 0 {
		if err := json.Unmarshal(answersJSON, &answers); err != nil {
			return domain.Assessment{}, richerror.New(op).WithErr(err).WithMessage("failed to unmarshal answers")
		}
	}

	return domain.Assessment{
		ID:          assessmentvalueobject.AssessmentID(assessmentID),
		UserID:      uservalueobject.UserID(dbUserID),
		Status:      assessmentvalueobject.AssessmentStatus(status),
		Answers:     answers,
		TotalScore:  totalScore,
		TraumaType:  assessmentvalueobject.TraumaType(traumaType),
		StartedAt:   startedAt,
		CompletedAt: completedAt,
	}, nil
}

// // FindLatestByUserID پیدا کردن آخرین ارزیابی کاربر
// func (d *DB) FindLatestByUserID(ctx context.Context, userID string) (*assessment.Assessment, error) {
// 	const op = "postgresassessment.FindLatestByUserID"

// 	query := `
// 	SELECT
// 		id, user_id, status, answers, total_score, trauma_type, started_at, completed_at
// 	FROM assessments
// 	WHERE user_id = $1
// 	ORDER BY started_at DESC
// 	LIMIT 1`

// 	var (
// 		assessmentID string
// 		dbUserID     string
// 		status       string
// 		answersJSON  []byte
// 		totalScore   int
// 		traumaType   string
// 		startedAt    time.Time
// 		completedAt  *time.Time
// 	)

// 	err := d.conn.QueryRow(ctx, query, userID).Scan(
// 		&assessmentID,
// 		&dbUserID,
// 		&status,
// 		&answersJSON,
// 		&totalScore,
// 		&traumaType,
// 		&startedAt,
// 		&completedAt,
// 	)
// 	if err != nil {
// 		return nil, richerror.New(op).WithErr(err).WithMessage("failed to find latest assessment")
// 	}

// 	// تبدیل Answers از JSON
// 	var answers []assessment.Answer
// 	if err := json.Unmarshal(answersJSON, &answers); err != nil {
// 		return nil, richerror.New(op).WithErr(err).WithMessage("failed to unmarshal answers")
// 	}

// 	// ساخت ارزیابی
// 	result := &assessment.Assessment{
// 		ID:          valueobject.AssessmentID(assessmentID),
// 		UserID:      dbUserID,
// 		Status:      valueobject.AssessmentStatus(status),
// 		Answers:     answers,
// 		TotalScore:  totalScore,
// 		TraumaType:  valueobject.TraumaType(traumaType),
// 		StartedAt:   startedAt,
// 		CompletedAt: completedAt,
// 	}

// 	return result, nil
// }
