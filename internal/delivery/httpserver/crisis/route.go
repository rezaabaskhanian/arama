package crisishandler

import "github.com/labstack/echo/v4"

func (h Handler) SetUserRoutes(e *echo.Echo) {

	userGroup := e.Group("/crisis")

	userGroup.POST("/start", h.Start)

}
