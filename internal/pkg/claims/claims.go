package claims

import (
	"aramina/internal/config"
	authservice "aramina/internal/service/auth"
	"fmt"

	"github.com/labstack/echo/v4"
)

func GetClaims(c echo.Context) (*authservice.Claims, error) {

	claims, ok := c.Get(config.AuthMiddlewareContextKey).(*authservice.Claims)
	if !ok || claims == nil {
		return nil, fmt.Errorf("claims not found in context")
	}

	return c.Get(config.AuthMiddlewareContextKey).(*authservice.Claims), nil

}
