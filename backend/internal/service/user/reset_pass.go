package userservice

import (
	uservalueobject "aramina/internal/domain/user/valueobject"
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/user/dto"
)

func (s Service) ResetPassword(req dto.ResetPasswordRequest) error {

	const op = "userservice.ResetPassword"
	passHash, err := uservalueobject.NewPassword(req.Password)
	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("dont create password")
	}

	errRepo := s.repo.ResetPassword(req.Nickname, passHash)

	if errRepo != nil {
		return richerror.New(op).WithErr(err).WithMessage("failed to reset password")
	}

	return nil

}
