package journalhandler

import (
	"aramina/internal/pkg/claims"
	"aramina/internal/pkg/richerror"
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) UpsertTodayMood(c echo.Context) error {

	const op = "journalhandler.TodayMoodAdd"

	claims, err := claims.GetClaims(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"message": "احراز هویت ناموفق",
		})
	}

	var req struct {
		Mood int `json:"mood"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "مشکل در دریافت ورودی",
		})
	}

	if err := h.journalSvc.UpsertTodayMood(context.Background(), claims.UserID, req.Mood); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": richerror.New(op).WithErr(err).Message(),
		})
	}

	return c.JSON(http.StatusOK, map[string]bool{"success": true})

}
