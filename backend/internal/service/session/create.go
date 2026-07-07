package sessionservice

import (
	domain "aramina/internal/domain/session"
	sessionvalueobject "aramina/internal/domain/session/valueobject"
	uservalueobject "aramina/internal/domain/user/valueobject"
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/session/dto"
	"context"
)

func (s Service) CreateSession(req dto.SessionRequest, userID string) (dto.SessionResponse, error) {
	const op = "sessionservice.CreateSession"

	user, err := s.auth.GetUserByIDService(userID)

	if err != nil {
		return dto.SessionResponse{}, richerror.New(op).WithErr(err).WithMessage("چنین یوزری موجود نیست")
	}
	ctx := context.Background()

	newSession, err := domain.NewSession(
		uservalueobject.UserID(user.ID),
		sessionvalueobject.PsychologistID(req.PsychologistID),
		req.SlotTime,
	)
	if err != nil {
		return dto.SessionResponse{}, richerror.New(op).WithErr(err).WithMessage("مشکل در ساخت domain")
	}

	created, err := s.repo.Save(ctx, newSession)

	return dto.SessionResponse{SessionInfo: dto.SessionInfo{
		ID:             string(created.ID),
		UserID:         string(created.UserID),
		PsychologistID: string(created.PsychologistID),
		Status:         string(created.Status),
		SlotTime:       created.SlotTime,
		CreatedAt:      created.CreatedAt,
		CancelledAt:    created.CancelledAt,
		CompletedAt:    created.CompletedAt,
	}}, nil

}
