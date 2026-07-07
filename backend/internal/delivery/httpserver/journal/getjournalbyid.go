package journalhandler

import (
	"aramina/internal/pkg/claims"
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) GetJournalEntryByID(c echo.Context) error {
	const op = "journalhandler.GetJournalEntryByID"

	// گرفتن ID از URL
	entryID := c.Param("id")

	if entryID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "شناسه یادداشت وارد نشده است",
		})
	}

	// گرفتن userID از توکن
	claims, err := claims.GetClaims(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"message": "احراز هویت ناموفق",
		})
	}

	// فراخوانی سرویس
	journal, err := h.journalSvc.GetJournalEntryByID(context.Background(), entryID, claims.UserID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, journal)
}
