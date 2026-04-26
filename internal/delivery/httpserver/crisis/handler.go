package crisishandler

import crisisservice "aramina/internal/service/crisis"

type Handler struct {
	crisisSvc crisisservice.Service
}

func New(crisisSvc crisisservice.Service) Handler {
	return Handler{
		crisisSvc: crisisSvc,
	}
}
