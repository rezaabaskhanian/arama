package exercisehandler

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/exercise/dto"
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) GetExerciseByID(c echo.Context) error {
	const op = "GetExerciseByID.exercisehandler"

	exerciseID := c.Param("exerciseID")

	req := dto.GetByIDrequest{
		ExerciseID: exerciseID,
	}

	res, err := h.exerciseSvc.GetExerciseByID(context.Background(), req)

	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("مشکل در سرور")
	}

	return c.JSON(http.StatusOK, res)

}
