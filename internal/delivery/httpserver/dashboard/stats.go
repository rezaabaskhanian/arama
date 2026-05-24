package dashboardhandler

import (
	"aramina/internal/pkg/claims"
	"context"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) DashboardStats(c echo.Context) error {
	const op = "dashboardhandler.DashboardStats"

	fmt.Println(op, "ressmild")
	claims, err := claims.GetClaims(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"message": "احراز هویت ناموفق",
		})
	}

	traumaType := c.QueryParam("traumaType")

	res, err := h.dashboardSvc.GetDashboardStats(context.Background(), claims.UserID, traumaType)

	return c.JSON(http.StatusOK, res)
}
