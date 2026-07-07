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

	// از QueryParam استفاده کن، نه Param
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	offset, _ := strconv.Atoi(c.QueryParam("offset"))

	if limit == 0 {
		limit = 10 // پیش‌فرض
	}

	res, err := h.journalSvc.GetUserJournalEntries(context.Background(), claims.UserID, limit, offset)

	return c.JSON(http.StatusOK, res)

}
