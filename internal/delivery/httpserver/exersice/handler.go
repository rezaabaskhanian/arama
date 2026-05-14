package exercisehandler

import (
	authservice "aramina/internal/service/auth"
	exerciseservice "aramina/internal/service/exercise"
)

type Handler struct {
	exerciseSvc exerciseservice.Service

	authSvc authservice.Service

	authConfig authservice.Config
}

func New(exerciseSvc exerciseservice.Service, authSvc authservice.Service, authConfig authservice.Config, authSingKey string) Handler {
	return Handler{exerciseSvc: exerciseSvc, authSvc: authSvc, authConfig: authConfig}
}
