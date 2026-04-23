package userservice

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/user/dto"
	"fmt"

	"github.com/jackc/pgx/v5"
)

func (s Service) Login(req dto.LoginRequest) (dto.LoginResponse, error) {

	const op = "userservice.Login"

	user, err := s.repo.GetUserByNickName(req.Nickname)

	if err != nil {
		if err == pgx.ErrNoRows {
			return dto.LoginResponse{}, fmt.Errorf("کاربری با این نام کاربری یافت نشد")
		}
		return dto.LoginResponse{}, err
	}

	if !user.VerifyPassword(req.Password) {
		return dto.LoginResponse{}, richerror.New(op).WithMessage("پسورد اشتباه است")
	}

	accessToken, err := s.auth.CreateAccessToken(user)
	if err != nil {
		return dto.LoginResponse{}, richerror.New(op).WithMessage("invalid password")
	}

	refreshToken, err := s.auth.CreateRefreshToken(user)
	if err != nil {
		return dto.LoginResponse{}, richerror.New(op).WithMessage("token generation failed")
	}

	return dto.LoginResponse{
		UserInfo: dto.UserInfo{
			ID:       string(user.ID), // UserID -> string
			Nickname: user.NickName,
			Phone:    user.Phone,
			Role:     user.Role,
		},
		Tokens: dto.Tokens{
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
		},
	}, nil

}
