package adminhandler

import (
	"aramina/internal/service/admin/dto"
	"net/http"

	"github.com/labstack/echo/v4"
)

// UpdateExercise ویرایش تمرین
func (h Handler) UpdateExercise(c echo.Context) error {
	id := c.Param("id")

	var req dto.UpdateExerciseRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "ورودی نامعتبر است",
		})
	}
	req.ID = id

	if err := h.adminSvc.UpdateExercise(c.Request().Context(), req); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": err.Error(),
		})
	}
	return c.JSON(http.StatusOK, map[string]string{
		"message": "تمرین با موفقیت به‌روزرسانی شد",
	})
}
