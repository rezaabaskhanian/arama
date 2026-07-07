package assessmenthandler

import (
	"aramina/internal/pkg/richerror"
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) GetAssessmentResult(c echo.Context) error {
	const op = "assessmenthandler.GetAssessmentResult"

	assessmentID := c.Param("id")

	res, err := h.assessmentSvc.AssessmentResult(context.Background(), assessmentID)

	if err != nil {
		return richerror.New(op).WithErr(err)
	}

	return c.JSON(http.StatusOK, res)
}
