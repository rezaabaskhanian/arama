package exercisehandler

import (
	"aramina/internal/pkg/claims"
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
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": richerror.New(op).WithErr(err).WithMessage("مشکل در فرستادن ورودی").Message(),
		})
	}
	claims, err := claims.GetClaims(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"message": "لطفا ابتدا وارد حساب کاربری خود شوید",
		})
	}
	exerciseID := c.Param("exerciseID")

	req = dto.CompleteExrciseRequest{
		ExerciseID: exerciseID,
		UserID:     claims.UserID,
		TraumaType: req.TraumaType,
	}

	completeExer, err := h.exerciseSvc.CompletedExercises(context.Background(), req)

	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": richerror.New(op).WithErr(err).Message(),
		})
	}

	return c.JSON(http.StatusOK, completeExer)

}
