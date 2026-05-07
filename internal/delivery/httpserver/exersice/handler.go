package exercisehandler

import exerciseservice "aramina/internal/service/exercise"

type Handler struct {
	exerciseSvc exerciseservice.Service
}

func New(exerciseSvc exerciseservice.Service) Handler {
	return Handler{exerciseSvc: exerciseSvc}
}
