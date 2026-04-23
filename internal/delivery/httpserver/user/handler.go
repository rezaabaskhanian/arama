package userhandler

import (
	authservice "aramina/internal/service/auth"
	userservice "aramina/internal/service/user"
)

type Handler struct {
	userSvc userservice.Service
	authSvc authservice.Service

	authConfig authservice.Config
}

func New(userSvc userservice.Service, authSvc authservice.Service, authConfig authservice.Config, authSingKey string) Handler {
	return Handler{userSvc: userSvc, authSvc: authSvc, authConfig: authConfig}
}
