package crisishandler

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/crisis/dto"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) Start(c echo.Context) error {
	const op = "crisishandler.Start"
	var req dto.CrisisRequest

	if err := c.Bind(&req); err != nil {

		return richerror.New(op).WithErr(err)
	}

	res, err := h.crisisSvc.StartCrisis(req)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, res)

}
