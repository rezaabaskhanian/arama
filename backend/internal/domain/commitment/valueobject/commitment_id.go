package commitmentvalueobject

import "github.com/google/uuid"

type CommitmentID string

func NewCommitmentID() CommitmentID {
	return CommitmentID(uuid.NewString())
}
