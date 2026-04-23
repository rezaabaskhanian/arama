package userhandler

import (
	"github.com/labstack/echo/v4"
)

func (h Handler) SetUserRoutes(e *echo.Echo) {

	userGroup := e.Group("/user")

	// userGroup.GET("/profile", h.Profile, middlware.Auth(h.authSvc, h.authConfig))

	userGroup.GET("/login", h.Login)
	userGroup.POST("/register", h.Register)

}
