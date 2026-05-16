package journalhandler

import (
	"aramina/internal/pkg/claims"
	"aramina/internal/pkg/richerror"
	"context"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

func (h Handler) GetUserJournals(c echo.Context) error {

	const op = "journalhandler.GetUserJournals"

	claims, err := claims.GetClaims(c)
	if err != nil {
		return richerror.New(op).WithErr(err)
	}

	limit, _ := strconv.Atoi(c.Param("limit"))
	offest, _ := strconv.Atoi(c.Param("offset"))

	res, err := h.journalSvc.GetUserJournalEntries(context.Background(), claims.UserID, limit, offest)

	return c.JSON(http.StatusOK, res)

}
