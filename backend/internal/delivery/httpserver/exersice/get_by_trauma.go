package exercisehandler

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/exercise/dto"
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) GetExerciseByTrauma(c echo.Context) error {
	const op = "exercisehandler.GetExerciseTrauma"

	traumaType := c.Param("traumaType")

	req := dto.GetByTraumaTypeRequest{
		TraumaType: traumaType,
	}

	res, err := h.exerciseSvc.GetExercisByTraumaType(context.Background(), req)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": richerror.New(op).WithErr(err).Error(),
		})
	}

	return c.JSON(http.StatusOK, res)

}
