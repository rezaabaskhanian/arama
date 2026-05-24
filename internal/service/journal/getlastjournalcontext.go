// internal/service/journal/service.go

package journalservice

import (
	"aramina/internal/pkg/richerror"
	"context"
)

func (s Service) GetLatestJournalContent(ctx context.Context, userID string) (string, error) {
	const op = "journalservice.GetLatestJournalContent"

	content, err := s.repo.GetLatestJournalContent(ctx, userID)
	if err != nil {
		return "", richerror.New(op).WithErr(err).WithMessage("خطا در دریافت آخرین یادداشت")
	}

	return content, nil
}
