package journalservice

import (
	"aramina/internal/pkg/richerror"
	"context"
)

func (s Service) DeleteJournalEntry(ctx context.Context, journalID string, userID string) error {
	const op = "journalservice.DeleteJournalEntry"

	// اول پیدا کن (و چک کن مال خودش است)
	journal, err := s.repo.FindByID(ctx, journalID, userID)
	if err != nil {
		return richerror.New(op).WithErr(err).WithMessage("یادداشت یافت نشد")
	}

	err = s.repo.Delete(ctx, string(journal.ID))

	if err != nil {
		return richerror.New(op).WithErr(err)
	}

	return err
}
