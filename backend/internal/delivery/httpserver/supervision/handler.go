package supervisionhandler

import (
	authservice "aramina/internal/service/auth"
	supervisionservice "aramina/internal/service/supervision"
)

type Handler struct {
	supervisionSvc supervisionservice.Service
	authSvc        authservice.Service
	authConfig     authservice.Config
}

func New(supervisionSvc supervisionservice.Service, authSvc authservice.Service, authConfig authservice.Config) Handler {
	return Handler{
		supervisionSvc: supervisionSvc,
		authSvc:        authSvc,
		authConfig:     authConfig,
	}
}
