package adminhandler

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) GetAllExercises(c echo.Context) error {
	exercises, err := h.adminSvc.GetAllExercises(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": err.Error(),
		})
	}
	return c.JSON(http.StatusOK, exercises)
}
