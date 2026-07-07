package exercisehandler

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/exercise/dto"
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) CreateExercise(c echo.Context) error {

	const op = "exercisehandler.CreateExercise"

	var req dto.CreateExerciseRequest

	if err := c.Bind(&req); err != nil {
		return richerror.New(op).WithErr(err)
	}

	res, err := h.exerciseSvc.CreateExercise(context.Background(), req)

	if err != nil {
		richerror.New(op).WithErr(err)
	}

	return c.JSON(http.StatusOK, res)

}
