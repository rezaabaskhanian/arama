package journalhandler

import (
	"aramina/internal/pkg/claims"
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/journal/dto"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) UpdateJournal(c echo.Context) error {
	const op = "journalhandler.UpdateJournal"

	var req dto.JournalUpdateRequest

	claims, err := claims.GetClaims(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"message": "احراز هویت ناموفق",
		})
	}

	if err := c.Bind(&req); err != nil {
		return richerror.New(op).WithErr(err).WithMessage("مشکل در دادن  ورودی")
	}

	// اعتبارسنجی
	if req.JournalID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "شناسه یادداشت وارد نشده است",
		})
	}
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

	err = h.journalSvc.UpdateJournalEntry(c.Request().Context(), req, claims.UserID)

	return c.JSON(http.StatusOK, map[string]string{
		"message": "یادداشت با موفقیت به‌روزرسانی شد",
	})
}
