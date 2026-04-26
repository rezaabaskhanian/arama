package crisisservice

import (
	domain "aramina/internal/domain/crisis"
	crisisvalueobject "aramina/internal/domain/crisis/valueobject"
)

type Repository interface {
	Save(c domain.Crisis) (domain.Crisis, error)
	GetByID(id crisisvalueobject.CrisisID) (domain.Crisis, error)
	Delete(id crisisvalueobject.CrisisID) error
}

type Service struct {
	repo Repository
}

func New(repo Repository) Service {
	return Service{repo: repo}
}
