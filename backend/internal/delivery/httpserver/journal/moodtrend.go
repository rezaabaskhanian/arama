package journalhandler

import (
	"aramina/internal/pkg/claims"
	"context"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

// MoodTrend روند حس‌وحال کاربر در N روز اخیر را برمی‌گرداند
func (h Handler) MoodTrend(c echo.Context) error {
	const op = "journalhandler.MoodTrend"

	cl, err := claims.GetClaims(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "احراز هویت ناموفق"})
	}

	days := 14
	if q := c.QueryParam("days"); q != "" {
		if n, e := strconv.Atoi(q); e == nil && n > 0 && n <= 90 {
			days = n
		}
	}

	moods, err := h.journalSvc.GetRecentMoods(context.Background(), cl.UserID, days)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
	}
	if moods == nil {
		moods = []int{}
	}

	streak, _ := h.journalSvc.GetCurrentStreak(context.Background(), cl.UserID)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"moods":  moods,
		"days":   days,
		"streak": streak,
	})
}
