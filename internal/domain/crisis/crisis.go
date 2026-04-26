package crisissesseion

import (
	crisisvalueobject "aramina/internal/domain/crisis/valueobject"
	"errors"
	"time"
)

type Crisis struct {
	ID          crisisvalueobject.CrisisID
	UserID      *crisisvalueobject.UserID // چون nullable است
	CurrentStep string
	RiskLevel   string
	StartedAt   time.Time
	CompletedAt *time.Time // چون nullable است
	Result      string
}

func NewCrisis(userID crisisvalueobject.UserID, currentstep string, risklevel string, result string) (Crisis, error) {

	if currentstep == "" || risklevel == "" || result == "" {
		return Crisis{}, errors.New(" لطفا همه موارد را پر کنید ")
	}

	return Crisis{
		ID:          crisisvalueobject.NewCrisisID(),
		UserID:      &userID,
		CurrentStep: currentstep,
		RiskLevel:   risklevel,
		StartedAt:   time.Now(),
		Result:      result,
	}, nil

}
