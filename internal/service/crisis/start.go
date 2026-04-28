package crisisservice

import (
	domain "aramina/internal/domain/crisis"
	uservalueobject "aramina/internal/domain/user/valueobject"
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/crisis/dto"
	"fmt"
	"strings"
)

func (s Service) StartCrisis(req dto.CrisisRequest) (dto.CrisisResponse, error) {
	const op = "crisisservice.StartCrisis"

	cr, err := domain.NewCrisis(uservalueobject.UserID(req.UserID), req.CurrentStep, req.RiskLevel, req.Result)

	if err != nil {
		return dto.CrisisResponse{}, richerror.New(op).WithErr(err)
	}

	crisis, err := s.repo.Save(cr)

	if err != nil {

		if err != nil {
			if strings.Contains(err.Error(), "duplicate") {
				return dto.CrisisResponse{}, fmt.Errorf("user already exists")
			}
			return dto.CrisisResponse{}, fmt.Errorf("database error")
		}
	}

	return dto.CrisisResponse{
		CrisisInfo: dto.CrisisInfo{
			ID:          string(crisis.ID),
			UserID:      string(crisis.UserID),
			CurrentStep: crisis.CurrentStep,
			RiskLevel:   crisis.RiskLevel,
			Result:      crisis.Result,
		}}, nil

}
