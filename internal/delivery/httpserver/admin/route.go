package adminhandler

import (
	"aramina/internal/delivery/middlware"

	"github.com/labstack/echo/v4"
)

func (h Handler) SetRouteAdmin(e *echo.Echo) {

	adminGroup := e.Group("/admin")

	adminGroup.GET("/stats", h.GetDashboardStats, middlware.Auth(h.authSvc, h.authConfig), middlware.AdminOnly)
	adminGroup.GET("/users", h.GetAllUsers, middlware.Auth(h.authSvc, h.authConfig), middlware.AdminOnly)
	adminGroup.PUT("/users/:id/role", h.UpdateUserRole, middlware.Auth(h.authSvc, h.authConfig), middlware.AdminOnly)
}
