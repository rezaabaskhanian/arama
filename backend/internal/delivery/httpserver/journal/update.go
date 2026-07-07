package journalhandler

import (
	"aramina/internal/pkg/claims"
	"aramina/internal/service/journal/dto"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) UpdateJournal(c echo.Context) error {
	const op = "journalhandler.UpdateJournal"

	// گرفتن ID از URL
	journalID := c.Param("id")
	if journalID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "شناسه یادداشت وارد نشده است",
		})
	}

	// خواندن body
	var req dto.JournalUpdateRequest
	if err := c.Bind(&req); err != nil {

		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "ورودی نامعتبر است",
		})
	}

	// مقداردهی JournalID
	req.JournalID = journalID

	// گرفتن userID از توکن
	claims, err := claims.GetClaims(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"message": "احراز هویت ناموفق",
		})
	}

	// اعتبارسنجی
	if req.Content == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "متن یادداشت نمی‌تواند خالی باشد",
		})
	}
	if req.Mood < 1 || req.Mood > 5 {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "مقدار حس معتبر نیست (1 تا 5)",
		})
	}

	// به‌روزرسانی
	err = h.journalSvc.UpdateJournalEntry(c.Request().Context(), req, claims.UserID)
	if err != nil {

		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "یادداشت با موفقیت به‌روزرسانی شد",
	})
}
