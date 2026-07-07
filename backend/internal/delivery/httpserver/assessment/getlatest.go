package assessmenthandler

import (
	"aramina/internal/pkg/claims"
	"aramina/internal/pkg/richerror"
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) GetAssessmentLatest(c echo.Context) error {

	const op = "assessmenthandler.GetAssessmentLatest"

	claims, err := claims.GetClaims(c)
	if err != nil {
		return richerror.New(op).WithErr(err)
	}

	res, err := h.assessmentSvc.GetAssessmentLatest(context.Background(), claims.UserID)

	return c.JSON(http.StatusOK, res)

}
