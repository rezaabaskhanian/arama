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

	var mood int

	if err := c.Bind(&mood); err != nil {
		return richerror.New(op).WithErr(err)
	}

	err = h.journalSvc.UpsertTodayMood(context.Background(), claims.UserID, mood)

	return c.JSON(http.StatusOK, err)

}
