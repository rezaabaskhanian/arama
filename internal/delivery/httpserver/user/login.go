package userhandler

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/user/dto"
	"fmt"
	"log"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) Login(c echo.Context) error {
	const op = "httpserver.Login"
	var req dto.LoginRequest

	if err := c.Bind(&req); err != nil {
		log.Println(op, "Bind error:", err)
		return richerror.New(op).WithErr(err)
	}

	res, err := h.userSvc.Login(req)

	fmt.Println(res, "ressss")

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, res)

}
