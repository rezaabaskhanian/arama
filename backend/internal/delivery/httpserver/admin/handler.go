package adminhandler

import (
	adminservice "aramina/internal/service/admin"
	authservice "aramina/internal/service/auth"
)

type Handler struct {
	adminSvc adminservice.Service

	authSvc authservice.Service

	authConfig authservice.Config
}

func New(adminSvc adminservice.Service, authSvc authservice.Service, authConfig authservice.Config) Handler {
	return Handler{adminSvc: adminSvc, authSvc: authSvc, authConfig: authConfig}
}
