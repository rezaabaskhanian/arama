package userservice

import (
	uservalueobject "aramina/internal/domain/user/valueobject"

	domain "aramina/internal/domain/user"
)

type Repository interface {
	CreateUser(u domain.User) (domain.User, error)
	GetUserByID(ID string) (domain.User, error)
	GetUserByNickName(nikname string) (domain.User, error)

	ResetPassword(nikname string, hashedPassword uservalueobject.Password) error
}

type AuthGenerator interface {
	CreateAccessToken(user domain.User) (string, error)
	CreateRefreshToken(user domain.User) (string, error)
}

type Service struct {
	repo Repository
	auth AuthGenerator
}

// // GetUserByID implements [sessionservice.UserService].
// func (s Service) GetUserByID(ID string) (domain.User, error) {
// 	panic("unimplemented")
// }

func New(repo Repository, auth AuthGenerator) Service {
	return Service{repo: repo, auth: auth}
}
