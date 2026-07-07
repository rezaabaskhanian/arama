package commitmenthandler

import (
	authservice "aramina/internal/service/auth"
	commitmentservice "aramina/internal/service/commitment"
)

type Handler struct {
	commitmentSvc commitmentservice.Service
	authSvc       authservice.Service
	authConfig    authservice.Config
}

func New(commitmentSvc commitmentservice.Service, authSvc authservice.Service, authConfig authservice.Config) Handler {
	return Handler{
		commitmentSvc: commitmentSvc,
		authSvc:       authSvc,
		authConfig:    authConfig,
	}
}
