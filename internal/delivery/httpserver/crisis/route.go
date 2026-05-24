package crisishandler

import "github.com/labstack/echo/v4"

func (h Handler) SetCrisisRoutes(e *echo.Echo) {

	crisisGroup := e.Group("/crisis")

	crisisGroup.POST("/check", h.CheckCrisis)

	crisisGroup.GET("/active", h.GetActiveCrisis)
	crisisGroup.PUT("/:id/resolve", h.ResolveCrisis)

}
