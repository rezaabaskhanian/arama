package userhandler

import (
	"aramina/internal/pkg/claims"
	"aramina/internal/pkg/richerror"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) Profile(c echo.Context) error {

	const op = "userhandler.Profile"

	claims, err := claims.GetClaims(c)
	if err != nil {
		return richerror.New(op).WithErr(err)
	}

	res, err := h.userSvc.Profile(claims.UserID)

	if err != nil {
		return richerror.New(op).WithErr(err)
	}

	return c.JSON(http.StatusOK, res)
}
