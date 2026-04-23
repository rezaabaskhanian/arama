package postgresuser

import (
	domain "aramina/internal/domain/user"
	uservalueobject "aramina/internal/domain/user/valueobject"
	"aramina/internal/pkg/errmesg"
	"aramina/internal/pkg/richerror"
	"context"

	"github.com/jackc/pgx/v5"
)

func (r DB) CreateUser(u domain.User) (domain.User, error) {

	const op = "postgres.CreateUser"

	query := `INSERT INTO users (
    id, nickname, password_hash,phone,role , created_at, updated_at
) VALUES ($1, $2, $3, $4, $5,now(), now())
RETURNING id;`

	var id string
	err := r.conn.QueryRow(
		context.Background(),
		query,
		u.ID,
		u.NickName,
		u.Password.Hash(),
		u.Phone,
		u.Role,
	).Scan(&id)

	if err != nil {
		return domain.User{}, richerror.New(op).WithErr(err).WithMessage("failed to insert user")
	}

	uid, err := uservalueobject.ParseUserID(id)
	if err != nil {
		return domain.User{}, richerror.New(op).WithErr(err).WithMessage("invalid UUID returned")
	}

	u.ID = uid

	return u, nil

}

// GetUserByID implements [userservice.Repository].
func (r DB) GetUserByID(ID string) (domain.User, error) {
	panic("unimplemented")
}

// GetUserByNickName implements [userservice.Repository].
func (r DB) GetUserByNickName(nickname string) (domain.User, error) {
	const op = "postgres.GetUserByNickName"

	query := ` SELECT id, nickname,password_hash,phone,role , created_at, updated_at
        FROM users
        WHERE nickname = $1`
	var (
		u      domain.User
		rawID  string // یا uuid.UUID بسته به نوع ستون در دیتابیس
		rawPwd string // هش پسورد به‌صورت رشته
	)

	err := r.conn.QueryRow(context.Background(), query, nickname).Scan(
		&rawID,
		&u.NickName,
		&rawPwd,

		&u.Phone,
		&u.Role,
		&u.CreatedAt,
		&u.UpdatedAt,
	)
	if err != nil {

		if err == pgx.ErrNoRows {
			return domain.User{}, richerror.New(op).
				WithErr(err).
				WithMessage(errmesg.ErrorMsgCantScanQueryResult).
				WithKind(richerror.KindUnexpected)
		}
		return domain.User{}, err

	}

	uid, err := uservalueobject.ParseUserID(rawID)
	if err != nil {
		return domain.User{}, richerror.New(op).
			WithErr(err).
			WithMessage("invalid UUID returned from DB")
	}
	u.ID = uid

	u.Password = *uservalueobject.NewPasswordFromHash(rawPwd)

	return u, nil

}

// ResetPassword implements [userservice.Repository].
func (r DB) ResetPassword(nikname string, hashedPassword uservalueobject.Password) error {
	panic("unimplemented")
}
