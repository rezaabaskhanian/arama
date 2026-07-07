package exercisehandler

import (
	"aramina/internal/pkg/claims"
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/exercise/dto"
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) GetUserProgress(c echo.Context) error {

	const op = "exercisehandler.GetUserProgress"

	traumaType := c.QueryParam("trauma_type")

	claims, err := claims.GetClaims(c)
	if err != nil {
		return richerror.New(op).WithErr(err)
	}

	req := dto.GetUserProgressRequest{
		UserID:     claims.UserID,
		TraumaType: traumaType, // ← مقداردهی
	}

	res, err := h.exerciseSvc.GetUserProgress(context.Background(), req)

	if err != nil {
		return richerror.New(op).WithErr(err)
	}

	return c.JSON(http.StatusOK, res)

}
