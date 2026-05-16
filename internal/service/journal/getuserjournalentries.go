package journalservice

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/journal/dto"
	"context"
)

func (s Service) GetUserJournalEntries(ctx context.Context, userID string, limit, offset int) ([]dto.JournalInfo, error) {
	const op = "journalservice.GetUserJournalEntries"

	res, err := s.repo.FindByUserID(ctx, userID, limit, offset)

	if err != nil {
		return []dto.JournalInfo{}, richerror.New(op).WithErr(err).WithMessage("چنین یوزری موجود نیست")
	}

	result := make([]dto.JournalInfo, 0, len(res))
	for _, jo := range res {
		result = append(result, dto.JournalInfo{
			ID:        string(jo.ID),
			UserID:    string(jo.UserID),
			Content:   jo.Content,
			Mood:      int(jo.Mood),
			CreatedAt: jo.CreatedAt,
			UpdatedAt: jo.UpdatedAt,
		})
	}

	return result, nil

}
