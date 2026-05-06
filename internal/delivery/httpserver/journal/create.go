package journalhandler

import (
	"aramina/internal/pkg/claims"
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/journal/dto"
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) CreateJournal(c echo.Context) error {

	const op = "journalhandler.CreateJournal"

	claims, err := claims.GetClaims(c)
	if err != nil {
		return richerror.New(op).WithErr(err)
	}

	var req dto.JournalCreateRequest

	if err := c.Bind(&req); err != nil {
		return richerror.New(op).WithErr(err)
	}

	res, err := h.journalSvc.CreateJournal(context.Background(), req, claims.UserID)

	return c.JSON(http.StatusOK, res)

}
