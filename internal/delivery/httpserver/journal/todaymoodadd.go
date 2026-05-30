package journalhandler

import (
	"aramina/internal/pkg/claims"
	"aramina/internal/pkg/richerror"
	"context"
	"fmt"
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
		return richerror.New(op).WithErr(err)
	}

	fmt.Println(req.Mood, op, "sdfsd")

	err = h.journalSvc.UpsertTodayMood(context.Background(), claims.UserID, req.Mood)

	return c.JSON(http.StatusOK, err)

}
