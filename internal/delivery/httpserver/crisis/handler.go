package crisishandler

import (
	assessmentservice "aramina/internal/service/assessment"
	crisisservice "aramina/internal/service/crisis"
	exerciseservice "aramina/internal/service/exercise"
	journalservice "aramina/internal/service/journal"
)

type Handler struct {
	crisisSvc     crisisservice.Service
	assessmentSvc assessmentservice.Service
	journalSvc    journalservice.Service
	exerciseSvc   exerciseservice.Service
}

func New(crisisSvc crisisservice.Service, assessmentSvc assessmentservice.Service,
	journalSvc journalservice.Service, exerciseSvc exerciseservice.Service) Handler {
	return Handler{
		crisisSvc:     crisisSvc,
		assessmentSvc: assessmentSvc,
		journalSvc:    journalSvc,
		exerciseSvc:   exerciseSvc,
	}
}
