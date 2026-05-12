package assessmenthandler

import (
	"aramina/internal/delivery/middlware"

	"github.com/labstack/echo/v4"
)

func (h Handler) SetAssessmentRoute(e *echo.Echo) {
	groupeAssessment := e.Group("/assessment")

	groupeAssessment.POST("/start", h.StartHandler, middlware.Auth(h.authSvc, h.authConfig))

	groupeAssessment.GET("/questions", h.GetAllQuestions, middlware.Auth(h.authSvc, h.authConfig))

	groupeAssessment.POST("/submit", h.SubmitAnswer, middlware.Auth(h.authSvc, h.authConfig))

	groupeAssessment.GET("/result/:id", h.GetAssessmentResult, middlware.Auth(h.authSvc, h.authConfig))
}
