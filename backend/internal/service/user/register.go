package userservice

import (
	domain "aramina/internal/domain/user"
	"aramina/internal/pkg/validate"
	"aramina/internal/service/user/dto"
	"fmt"
	"strings"
)

func (s Service) Register(req dto.RegisterRequest) (dto.RegisterResponse, error) {

	const op = "user.Register"

	// اعتبارسنجی ورودی‌ها پیش از ساخت موجودیت
	if err := validate.Required(op, "نام", req.Nickname); err != nil {
		return dto.RegisterResponse{}, err
	}
	if err := validate.Phone(op, req.Phone); err != nil {
		return dto.RegisterResponse{}, err
	}
	if err := validate.Password(op, req.Password, 6); err != nil {
		return dto.RegisterResponse{}, err
	}

	user, err := domain.NewUser(
		req.Nickname, req.Password, req.Phone, req.Role,
	)

	if err != nil {
		return dto.RegisterResponse{}, fmt.Errorf("%s: %w", op, err)
	}

	// 2️⃣ ذخیره در Repository
	//پوینتر برمیگردانیم چون نمیخاهیم کپی شود و خافظه زیادی مصرف کند

	createdUser, err := s.repo.CreateUser(user)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate") {
			return dto.RegisterResponse{}, fmt.Errorf("user already exists")
		}
		return dto.RegisterResponse{}, fmt.Errorf("database error")
	}

	// 3️⃣ ایجاد توکن‌ها با User Aggregate
	accessToken, err := s.auth.CreateAccessToken(createdUser)
	if err != nil {
		return dto.RegisterResponse{}, fmt.Errorf("token generation failed")
	}

	refreshToken, err := s.auth.CreateRefreshToken(createdUser)
	if err != nil {
		return dto.RegisterResponse{}, fmt.Errorf("token generation failed")
	}

	// 4️⃣ ساخت DTO خروجی
	return dto.RegisterResponse{
		UserInfo: dto.UserInfo{
			ID:       string(createdUser.ID), // UserID -> string
			Nickname: createdUser.NickName,
			Phone:    createdUser.Phone,
			Role:     createdUser.Role,
		},
		Tokens: dto.Tokens{
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
		},
	}, nil

}
