package adminhandler

import (
	"aramina/internal/delivery/middlware"

	"github.com/labstack/echo/v4"
)

func (h Handler) SetAdminRoutes(e *echo.Echo) {

	adminGroup := e.Group("/admin")

	adminGroup.GET("/stats", h.GetDashboardStats, middlware.Auth(h.authSvc, h.authConfig), middlware.AdminOnly)
	adminGroup.GET("/users", h.GetAllUsers, middlware.Auth(h.authSvc, h.authConfig), middlware.AdminOnly)
	adminGroup.PUT("/users/:id/role", h.UpdateUserRole, middlware.Auth(h.authSvc, h.authConfig), middlware.AdminOnly)

	// مدیریت تمرین‌ها
	adminGroup.GET("/exercises", h.GetAllExercises, middlware.Auth(h.authSvc, h.authConfig), middlware.AdminOnly)
	adminGroup.POST("/exercises", h.CreateExercise, middlware.Auth(h.authSvc, h.authConfig), middlware.AdminOnly)
	adminGroup.PUT("/exercises/:id", h.UpdateExercise, middlware.Auth(h.authSvc, h.authConfig), middlware.AdminOnly)
	adminGroup.DELETE("/exercises/:id", h.DeleteExercise, middlware.Auth(h.authSvc, h.authConfig), middlware.AdminOnly)
}
