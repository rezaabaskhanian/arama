package adminhandler

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) DeleteExercise(c echo.Context) error {
	id := c.Param("id")

	if err := h.adminSvc.DeleteExercise(c.Request().Context(), id); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": err.Error(),
		})
	}
	return c.JSON(http.StatusOK, map[string]string{
		"message": "تمرین با موفقیت حذف شد",
	})
}
