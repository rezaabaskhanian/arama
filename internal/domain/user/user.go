package user

import (
	uservalueobject "aramina/internal/domain/user/valueobject"
	"errors"
	"time"
)

type User struct {
	ID        uservalueobject.UserID
	NickName  string
	Password  uservalueobject.Password
	Phone     string
	Role      string
	CreatedAt time.Time
	UpdatedAt time.Time
}

func NewUser(nickname string, password string, phone string, role string) (User, error) {

	if nickname == "" || phone == "" {
		return User{}, errors.New(" لطفا همه موارد را پر کنید ")
	}

	uid := uservalueobject.NewUserID()

	pass, err := uservalueobject.NewPassword(password)

	if err != nil {
		return User{}, err
	}

	now := time.Now()

	return User{
		ID:        uid,
		NickName:  nickname,
		Password:  pass,
		Phone:     phone,
		Role:      role,
		CreatedAt: now,
		UpdatedAt: now,
	}, nil

}
