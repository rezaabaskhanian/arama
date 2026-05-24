package dashboardhandler

import (
	authservice "aramina/internal/service/auth"
	dashboardservice "aramina/internal/service/dashboard"
)

type Handler struct {
	// exercisesSvc  exerciseservice.Service
	// journalSvc    journalservice.Service
	// assessmentSvc assessmentservice.Service

	dashboardSvc dashboardservice.Service

	authSvc    authservice.Service
	authConfig authservice.Config
}

func New(dashboardSvc dashboardservice.Service, authSvc authservice.Service, authConfig authservice.Config) Handler {

	return Handler{
		dashboardSvc: dashboardSvc,
		authSvc:      authSvc,
		authConfig:   authConfig,
	}
}
