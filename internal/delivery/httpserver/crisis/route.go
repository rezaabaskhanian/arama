package crisishandler

import (
	"aramina/internal/delivery/middlware"

	"github.com/labstack/echo/v4"
)

func (h Handler) SetCrisisRoutes(e *echo.Echo) {

	crisisGroup := e.Group("/crisis")

	crisisGroup.GET("/check", h.CheckCrisis, middlware.Auth(h.authSvc, h.authConfig))

	crisisGroup.GET("/active", h.GetActiveCrisis, middlware.Auth(h.authSvc, h.authConfig))
	crisisGroup.PUT("/:id/resolve", h.ResolveCrisis, middlware.Auth(h.authSvc, h.authConfig))

}
