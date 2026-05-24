package journalhandler

import (
	"aramina/internal/pkg/claims"
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) TodayMood(c echo.Context) error {

	const op = "journalhandler.TodayMood"

	claims, err := claims.GetClaims(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"message": "احراز هویت ناموفق",
		})
	}

	res, err := h.journalSvc.TodayMood(context.Background(), claims.UserID)

	return c.JSON(http.StatusOK, res)

}
