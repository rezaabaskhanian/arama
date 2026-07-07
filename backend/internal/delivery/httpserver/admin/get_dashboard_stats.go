package adminhandler

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// GetDashboardStats آمار پنل ادمین
func (h Handler) GetDashboardStats(c echo.Context) error {
	stats, err := h.adminSvc.GetDashboardStats(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, stats)
}
