package journalvalueobject

import "github.com/google/uuid"

type JournalID string

func NewJournalID() JournalID {
	return JournalID(uuid.NewString())
}
