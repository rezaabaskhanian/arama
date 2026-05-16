package journalhandler

import (
	"aramina/internal/pkg/claims"
	// "aramina/internal/pkg/richerror"

	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) DeleteJournal(c echo.Context) error {
	const op = "journalhandler.DeleteJournal"

	// گرفتن ID از URL
	journalID := c.Param("id")
	if journalID == "" {
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

	// حذف یادداشت
	err = h.journalSvc.DeleteJournalEntry(c.Request().Context(), journalID, claims.UserID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "یادداشت با موفقیت حذف شد",
	})
}
