package commitmenthandler

import (
	"aramina/internal/delivery/middlware"

	"github.com/labstack/echo/v4"
)

func (h Handler) SetCommitmentRoutes(e *echo.Echo) {

	g := e.Group("/commitments")

	// فهرست الگوهای تمرین واقعی زندگی
	g.GET("/templates", h.ListTemplates, middlware.Auth(h.authSvc, h.authConfig))

	// تعهدهای کاربر
	g.GET("/mine", h.ListMine, middlware.Auth(h.authSvc, h.authConfig))
	g.POST("/pledge", h.Pledge, middlware.Auth(h.authSvc, h.authConfig))
	g.POST("/:id/complete", h.Complete, middlware.Auth(h.authSvc, h.authConfig))
	g.DELETE("/:id", h.Cancel, middlware.Auth(h.authSvc, h.authConfig))
}
