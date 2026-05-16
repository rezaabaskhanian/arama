package journalhandler

import (
	authservice "aramina/internal/service/auth"
	journalservice "aramina/internal/service/journal"
	userservice "aramina/internal/service/user"
)

type Handler struct {
	journalSvc journalservice.Service

	userSvc userservice.Service

	authSvc authservice.Service

	authConfig authservice.Config
}

func New(journalSvc journalservice.Service, userSvc userservice.Service, authSvc authservice.Service, authConfig authservice.Config, authSingKey string) Handler {
	return Handler{journalSvc: journalSvc, userSvc: userSvc, authSvc: authSvc, authConfig: authConfig}
}
