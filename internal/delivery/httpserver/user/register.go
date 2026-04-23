package userhandler

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"

	"aramina/internal/service/user/dto"
)

func (h Handler) Register(c echo.Context) error {

	var uReq dto.RegisterRequest

	if err := c.Bind(&uReq); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest)
	}

	resp, err := h.userSvc.Register(uReq)

	if err != nil {
		fmt.Println("Register error:", err)
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusCreated, resp)

}
