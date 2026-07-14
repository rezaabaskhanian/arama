package postgresdevice

import (
	"aramina/internal/pkg/richerror"
	"context"
)

// SaveToken توکن دستگاه را ذخیره می‌کند؛ اگر token از قبل باشد فقط مالک و زمانش به‌روز می‌شود
// (مثلاً وقتی کاربر عوض می‌شود یا اپ token را دوباره می‌فرستد).
func (d DB) SaveToken(ctx context.Context, userID, token, platform string) error {
	const op = "postgresdevice.SaveToken"

	_, err := d.conn.Exec(ctx,
		`INSERT INTO device_tokens (user_id, token, platform, created_at, updated_at)
		 VALUES ($1, $2, $3, NOW(), NOW())
		 ON CONFLICT (token) DO UPDATE
		 SET user_id = EXCLUDED.user_id, platform = EXCLUDED.platform, updated_at = NOW()`,
		userID, token, platform,
	)
	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("خطا در ثبت دستگاه")
	}
	return nil
}

// TokensForUser همه‌ی توکن‌های دستگاه‌های یک کاربر را برمی‌گرداند
func (d DB) TokensForUser(ctx context.Context, userID string) ([]string, error) {
	const op = "postgresdevice.TokensForUser"

	rows, err := d.conn.Query(ctx, `SELECT token FROM device_tokens WHERE user_id = $1`, userID)
	if err != nil {
		return nil, richerror.New(op).WithErr(err)
	}
	defer rows.Close()

	var out []string
	for rows.Next() {
		var t string
		if err := rows.Scan(&t); err != nil {
			return nil, richerror.New(op).WithErr(err)
		}
		out = append(out, t)
	}
	return out, nil
}

// DeleteTokens توکن‌های نامعتبر (باطل‌شده توسط FCM) را حذف می‌کند
func (d DB) DeleteTokens(ctx context.Context, tokens []string) error {
	const op = "postgresdevice.DeleteTokens"
	if len(tokens) == 0 {
		return nil
	}
	_, err := d.conn.Exec(ctx, `DELETE FROM device_tokens WHERE token = ANY($1)`, tokens)
	if err != nil {
		return richerror.New(op).WithErr(err)
	}
	return nil
}
