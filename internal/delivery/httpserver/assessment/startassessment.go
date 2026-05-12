package assessmenthandler

import (
	"aramina/internal/pkg/claims"
	"aramina/internal/pkg/richerror"

	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) StartHandler(c echo.Context) error {
	const op = "assessmenthandler.StartHandler"

	claims, err := claims.GetClaims(c)
	if err != nil {
		return richerror.New(op).WithErr(err)
	}

	ass, err := h.assessmentSvc.StartAssessment(context.Background(), claims.UserID)

	return c.JSON(http.StatusCreated, ass)

}
