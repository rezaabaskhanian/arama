package devicehandler

import (
	"aramina/internal/delivery/middlware"

	"github.com/labstack/echo/v4"
)

func (h Handler) SetDeviceRoutes(e *echo.Echo) {
	g := e.Group("/devices")
	g.POST("", h.RegisterDevice, middlware.Auth(h.authSvc, h.authConfig))
}
