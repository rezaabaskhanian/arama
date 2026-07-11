package supervisionhandler

import (
	"aramina/internal/delivery/middlware"

	"github.com/labstack/echo/v4"
)

func (h Handler) SetSupervisionRoutes(e *echo.Echo) {

	g := e.Group("/supervision")

	// کاربر عادی
	g.GET("/status", h.GetStatus, middlware.Auth(h.authSvc, h.authConfig))
	g.POST("/toggle", h.Toggle, middlware.Auth(h.authSvc, h.authConfig))
	g.GET("/messages", h.MyMessages, middlware.Auth(h.authSvc, h.authConfig))

	// روانشناس / ادمین
	staff := e.Group("/admin/supervision")
	staff.GET("/users", h.ListSupervised, middlware.Auth(h.authSvc, h.authConfig), h.staffOnly)
	staff.GET("/users/:id/messages", h.UserMessages, middlware.Auth(h.authSvc, h.authConfig), h.staffOnly)
	staff.POST("/users/:id/messages", h.SendMessage, middlware.Auth(h.authSvc, h.authConfig), h.staffOnly)

	// اجرای دستی پیام‌های خودکار (همان کاری که ساعت ۸ شب خودکار انجام می‌شود)
	staff.POST("/run-fallback", h.RunFallback, middlware.Auth(h.authSvc, h.authConfig), h.staffOnly)
}
