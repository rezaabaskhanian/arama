package postgressupervision

import (
	domain "aramina/internal/domain/supervision"
	"aramina/internal/pkg/richerror"
	"context"
	"time"
)

// SetWantsSupervision وضعیت درخواست نظارت روانشناس را برای کاربر تنظیم می‌کند
func (d DB) SetWantsSupervision(ctx context.Context, userID string, wants bool) error {
	const op = "postgressupervision.SetWantsSupervision"

	_, err := d.conn.Exec(ctx, `UPDATE users SET wants_supervision = $2, updated_at = NOW() WHERE id = $1`, userID, wants)
	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("خطا در ذخیره‌ی تنظیمات نظارت")
	}
	return nil
}

// ListStaffIDs شناسه‌ی همه‌ی روانشناس‌ها و ادمین‌ها را برمی‌گرداند (برای نوتیف پیام ورودی کاربر)
func (d DB) ListStaffIDs(ctx context.Context) ([]string, error) {
	const op = "postgressupervision.ListStaffIDs"

	rows, err := d.conn.Query(ctx, `SELECT id::text FROM users WHERE role IN ('admin', 'therapist')`)
	if err != nil {
		return nil, richerror.New(op).WithErr(err)
	}
	defer rows.Close()

	var out []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, richerror.New(op).WithErr(err)
		}
		out = append(out, id)
	}
	return out, nil
}

// GetWantsSupervision وضعیت درخواست نظارت کاربر را می‌خواند
func (d DB) GetWantsSupervision(ctx context.Context, userID string) (bool, error) {
	const op = "postgressupervision.GetWantsSupervision"

	var wants bool
	err := d.conn.QueryRow(ctx, `SELECT wants_supervision FROM users WHERE id = $1`, userID).Scan(&wants)
	if err != nil {
		return false, richerror.New(op).WithErr(err)
	}
	return wants, nil
}

// SaveMessage یک پیام روانشناس/سیستم برای کاربر ثبت می‌کند
func (d DB) SaveMessage(ctx context.Context, userID, senderID, body string, isAuto bool) error {
	const op = "postgressupervision.SaveMessage"

	var sender interface{}
	if senderID == "" {
		sender = nil
	} else {
		sender = senderID
	}

	_, err := d.conn.Exec(ctx,
		`INSERT INTO supervision_messages (user_id, sender_id, body, is_auto, msg_date, created_at)
		 VALUES ($1, $2, $3, $4, CURRENT_DATE, NOW())`,
		userID, sender, body, isAuto,
	)
	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("خطا در ثبت پیام")
	}
	return nil
}

// ListMessagesForUser پیام‌های یک کاربر را (جدیدترین اول) همراه نام فرستنده برمی‌گرداند
func (d DB) ListMessagesForUser(ctx context.Context, userID string) ([]domain.Message, error) {
	const op = "postgressupervision.ListMessagesForUser"

	query := `
		SELECT m.id, m.user_id, COALESCE(m.sender_id::text, ''), COALESCE(s.nickname, ''),
		       m.body, m.is_auto, m.created_at
		FROM supervision_messages m
		LEFT JOIN users s ON s.id = m.sender_id
		WHERE m.user_id = $1
		ORDER BY m.created_at DESC`

	rows, err := d.conn.Query(ctx, query, userID)
	if err != nil {
		return nil, richerror.New(op).WithErr(err)
	}
	defer rows.Close()

	var out []domain.Message
	for rows.Next() {
		var m domain.Message
		if err := rows.Scan(&m.ID, &m.UserID, &m.SenderID, &m.SenderName, &m.Body, &m.IsAuto, &m.CreatedAt); err != nil {
			return nil, richerror.New(op).WithErr(err)
		}
		out = append(out, m)
	}
	return out, nil
}

// ListSupervisedUsers کاربرانی که خواسته‌اند روانشناس دنبال‌شان کند (برای پنل روانشناس)،
// همراه آخرین مود و آخرین زمان پیام و تعداد پیام‌ها
func (d DB) ListSupervisedUsers(ctx context.Context) ([]domain.SupervisedUser, error) {
	const op = "postgressupervision.ListSupervisedUsers"

	query := `
		SELECT u.id, u.nickname, u.phone,
		       COALESCE((SELECT jm.mood FROM journal_moods jm WHERE jm.user_id = u.id ORDER BY jm.date DESC LIMIT 1), 0) AS latest_mood,
		       (SELECT MAX(sm.created_at) FROM supervision_messages sm WHERE sm.user_id = u.id) AS last_message_at,
		       (SELECT COUNT(*) FROM supervision_messages sm WHERE sm.user_id = u.id) AS message_count
		FROM users u
		WHERE u.wants_supervision = true
		ORDER BY last_message_at ASC NULLS FIRST, u.created_at ASC`

	rows, err := d.conn.Query(ctx, query)
	if err != nil {
		return nil, richerror.New(op).WithErr(err)
	}
	defer rows.Close()

	var out []domain.SupervisedUser
	for rows.Next() {
		var su domain.SupervisedUser
		if err := rows.Scan(&su.UserID, &su.Nickname, &su.Phone, &su.LatestMood, &su.LastMessageAt, &su.MessageCount); err != nil {
			return nil, richerror.New(op).WithErr(err)
		}
		out = append(out, su)
	}
	return out, nil
}

// ListSupervisedUsersWithoutMessageOn کاربرانِ تحت نظارتی که در تاریخ داده‌شده هنوز پیامی نگرفته‌اند
// (برای پیام خودکار ساعت ۸ شب). آخرین مودشان هم برمی‌گردد تا متن مناسب ساخته شود.
func (d DB) ListSupervisedUsersWithoutMessageOn(ctx context.Context, date time.Time) ([]domain.SupervisedUser, error) {
	const op = "postgressupervision.ListSupervisedUsersWithoutMessageOn"

	query := `
		SELECT u.id, u.nickname, u.phone,
		       COALESCE((SELECT jm.mood FROM journal_moods jm WHERE jm.user_id = u.id ORDER BY jm.date DESC LIMIT 1), 0) AS latest_mood
		FROM users u
		WHERE u.wants_supervision = true
		  AND NOT EXISTS (
		      SELECT 1 FROM supervision_messages sm
		      WHERE sm.user_id = u.id AND sm.msg_date = $1::date
		  )`

	rows, err := d.conn.Query(ctx, query, date)
	if err != nil {
		return nil, richerror.New(op).WithErr(err)
	}
	defer rows.Close()

	var out []domain.SupervisedUser
	for rows.Next() {
		var su domain.SupervisedUser
		if err := rows.Scan(&su.UserID, &su.Nickname, &su.Phone, &su.LatestMood); err != nil {
			return nil, richerror.New(op).WithErr(err)
		}
		out = append(out, su)
	}
	return out, nil
}
