package exercisehandler

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/exercise/dto"
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) CompletedExercises(c echo.Context) error {

	const op = "exercisehandler.CompletedExercises"

	var req dto.CompleteExrciseRequest

	if err := c.Bind(&req); err != nil {
		richerror.New(op).WithErr(err).WithMessage("مشکل در فرستادن ورودی")
	}

	completeExer, err := h.exerciseSvc.CompletedExercises(context.Background(), req)

	if err != nil {
		richerror.New(op).WithErr(err)
	}

	return c.JSON(http.StatusOK, completeExer)

}
