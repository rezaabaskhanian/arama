package adminhandler

import (
	"aramina/internal/service/exercise/dto"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) CreateExercise(c echo.Context) error {
	var req dto.CreateExerciseRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "ورودی نامعتبر است",
		})
	}

	if req.Title == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "عنوان تمرین نمی‌تواند خالی باشد",
		})
	}
	if req.Description == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "توضیحات تمرین نمی‌تواند خالی باشد",
		})
	}
	if req.Duration <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "مدت زمان تمرین باید بیشتر از 0 باشد",
		})
	}

	exercise, err := h.adminSvc.CreateExercise(c.Request().Context(), req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": err.Error(),
		})
	}
	return c.JSON(http.StatusCreated, exercise)
}
