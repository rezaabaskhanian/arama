package sessionhandler

import (
	"aramina/internal/pkg/claims"
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/session/dto"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) CreateSession(c echo.Context) error {

	const op = "sessionhandler.CreateSession"

	claims, err := claims.GetClaims(c)
	if err != nil {
		return richerror.New(op).WithErr(err)
	}
	var req dto.SessionRequest

	if err := c.Bind(&req); err != nil {
		return richerror.New(op).WithErr(err)
	}

	res, err := h.sessionSvc.CreateSession(req, claims.UserID)

	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, res)

}
