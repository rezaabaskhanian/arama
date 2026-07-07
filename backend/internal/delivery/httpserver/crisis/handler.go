package crisishandler

import (
	assessmentservice "aramina/internal/service/assessment"
	authservice "aramina/internal/service/auth"
	crisisservice "aramina/internal/service/crisis"
	exerciseservice "aramina/internal/service/exercise"
	journalservice "aramina/internal/service/journal"
)

type Handler struct {
	crisisSvc     crisisservice.Service
	assessmentSvc assessmentservice.Service
	journalSvc    journalservice.Service
	exerciseSvc   exerciseservice.Service

	authSvc authservice.Service

	authConfig authservice.Config
}

func New(crisisSvc crisisservice.Service, assessmentSvc assessmentservice.Service,
	journalSvc journalservice.Service, exerciseSvc exerciseservice.Service, authSvc authservice.Service,
	authConfig authservice.Config, authSingKey string) Handler {
	return Handler{
		crisisSvc:     crisisSvc,
		assessmentSvc: assessmentSvc,
		journalSvc:    journalSvc,
		exerciseSvc:   exerciseSvc,

		authSvc:    authSvc,
		authConfig: authConfig,
	}
}
