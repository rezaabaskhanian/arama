package userhandler

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/user/dto"
	"log"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) ResetPass(c echo.Context) error {
	const op = "httpserver.ResetPass"
	var req dto.ResetPasswordRequest

	if err := c.Bind(&req); err != nil {
		log.Println(op, "Bind error:", err)
		return richerror.New(op).WithErr(err)
	}

	err := h.userSvc.ResetPassword(req)

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, "پسورد با موفقیت عوض شد")

}
