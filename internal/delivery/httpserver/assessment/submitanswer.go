package assessmenthandler

import (
	"aramina/internal/pkg/claims"
	"aramina/internal/pkg/richerror"
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) SubmitAnswer(c echo.Context) error {

	const op = "assessmenthandler.SubmitAnswer"

	claims, err := claims.GetClaims(c)
	if err != nil {
		return richerror.New(op).WithErr(err)
	}

	var req struct {
		AssessmentID string         `json:"assessment_id"`
		Answers      map[string]int `json:"answers"`
	}

	if err := c.Bind(&req); err != nil {
		return richerror.New(op).WithErr(err).WithMessage("dont get answers in front")
	}

	res, err := h.assessmentSvc.SubmitAnswer(context.Background(), claims.UserID, req.AssessmentID, req.Answers)

	return c.JSON(http.StatusOK, res)
}
