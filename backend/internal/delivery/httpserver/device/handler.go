package devicehandler

import (
	authservice "aramina/internal/service/auth"
	deviceservice "aramina/internal/service/device"
)

type Handler struct {
	deviceSvc  deviceservice.Service
	authSvc    authservice.Service
	authConfig authservice.Config
}

func New(deviceSvc deviceservice.Service, authSvc authservice.Service, authConfig authservice.Config) Handler {
	return Handler{
		deviceSvc:  deviceSvc,
		authSvc:    authSvc,
		authConfig: authConfig,
	}
}
