package exercisevalueobject

import "github.com/google/uuid"

type EexrciseID string

func NewEexrciseID() EexrciseID {
	return EexrciseID(uuid.NewString())
}
