package journalservice

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/journal/dto"
	"context"
)

func (s Service) GetJournalEntryByID(ctx context.Context, entryID, userID string) (dto.JournalInfo, error) {
	const op = "journalservice.GetJournalEntryByID"

	journal, err := s.repo.FindByID(ctx, entryID, userID)

	if err != nil {
		return dto.JournalInfo{}, richerror.New(op).WithErr(err).WithMessage("یادداشت یافت نشد")
	}

	return dto.JournalInfo{
		ID:        string(journal.ID),
		UserID:    string(journal.UserID),
		Content:   journal.Content,
		Mood:      int(journal.Mood),
		CreatedAt: journal.CreatedAt,
		UpdatedAt: journal.UpdatedAt,
	}, nil
}
