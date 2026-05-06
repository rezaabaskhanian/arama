package journalhandler

import (
	journalservice "aramina/internal/service/journal"
	userservice "aramina/internal/service/user"
)

type Handler struct {
	journalSvc journalservice.Service

	userSvc userservice.Service
}

func New(journalSvc journalservice.Service, userSvc userservice.Service) Handler {
	return Handler{journalSvc: journalSvc, userSvc: userSvc}
}
