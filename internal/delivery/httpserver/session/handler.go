package sessionhandler

import (
	sessionservice "aramina/internal/service/session"
	userservice "aramina/internal/service/user"
)

type Handler struct {
	sessionSvc sessionservice.Service

	userSvc userservice.Service
}

func New(sessionSvc sessionservice.Service, userSvc userservice.Service) Handler {
	return Handler{sessionSvc: sessionSvc, userSvc: userSvc}
}
