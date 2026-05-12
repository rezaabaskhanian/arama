package assessmenthandler

import (
	assessmentservice "aramina/internal/service/assessment"
	authservice "aramina/internal/service/auth"
)

type Handler struct {
	assessmentSvc assessmentservice.Service

	authSvc authservice.Service

	authConfig authservice.Config
}

func New(assessmentSvc assessmentservice.Service, authSvc authservice.Service, authConfig authservice.Config, authSingKey string) Handler {
	return Handler{assessmentSvc: assessmentSvc, authSvc: authSvc, authConfig: authConfig}
}
