package crisishandler

import "github.com/labstack/echo/v4"

func (h Handler) SetCrisisRoutes(e *echo.Echo) {

	crisisGroup := e.Group("/crisis")

	crisisGroup.POST("/start", h.Start)

}
