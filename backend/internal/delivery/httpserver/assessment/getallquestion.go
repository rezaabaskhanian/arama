package assessmenthandler

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/assessment/dto"
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) GetAllQuestions(c echo.Context) error {

	const op = "assessmenthandler.GetAllQuestion"

	que, err := h.assessmentSvc.GetQuestions(context.Background())

	if err != nil {

		return c.JSON(http.StatusInternalServerError,
			richerror.New(op).WithErr(err).WithMessage("عدم دریافت سوالات"),
		)
	}

	return c.JSON(http.StatusOK, dto.GetAllQuestionsResponse{
		Total:     len(que),
		Questions: que,
	})
}
