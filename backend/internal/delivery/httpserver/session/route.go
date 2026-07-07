package sessionhandler

import "github.com/labstack/echo/v4"

func (h Handler) SetSessionRoutes(e *echo.Echo) {

	sessionGroup := e.Group("/session")

	sessionGroup.POST("/create", h.CreateSession)

}
