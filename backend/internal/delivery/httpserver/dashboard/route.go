package dashboardhandler

import (
	"aramina/internal/delivery/middlware"

	"github.com/labstack/echo/v4"
)

func (h Handler) SetDashboardRoutes(e *echo.Echo) {

	dashboardGroup := e.Group("dashboard")

	dashboardGroup.GET("/stats/:traumaType", h.DashboardStats, middlware.Auth(h.authSvc, h.authConfig))

}
