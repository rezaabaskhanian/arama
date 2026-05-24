package adminservice

import (
	assessmentservice "aramina/internal/service/assessment"
	exerciseservice "aramina/internal/service/exercise"
	userservice "aramina/internal/service/user"
)

type Service struct {
	userRepo       userservice.Repository
	exerciseRepo   exerciseservice.Repository
	assessmentRepo assessmentservice.Repository
}

func New(userRepo userservice.Repository,
	exerciseRepo exerciseservice.Repository,
	assessmentRepo assessmentservice.Repository) Service {

	return Service{
		userRepo:       userRepo,
		exerciseRepo:   exerciseRepo,
		assessmentRepo: assessmentRepo,
	}

}
