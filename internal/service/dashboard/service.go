package dashboardservice

import (
	assessmentservice "aramina/internal/service/assessment"
	exerciseservice "aramina/internal/service/exercise"
	journalservice "aramina/internal/service/journal"
)

type Service struct {
	exerciseSvc   exerciseservice.Service
	journalSvc    journalservice.Service
	assessmentSvc assessmentservice.Service
}

func New(exerciseSvc exerciseservice.Service, journalSvc journalservice.Service, assessmentSvc assessmentservice.Service) Service {
	return Service{
		exerciseSvc:   exerciseSvc,
		journalSvc:    journalSvc,
		assessmentSvc: assessmentSvc,
	}
}
