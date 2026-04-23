package middlware

import (
	"net/http"

	"aramina/internal/pkg/richerror"
	authservice "aramina/internal/service/auth"

	mw "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"

	cfg "aramina/internal/config"
)

func Auth(service authservice.Service, config authservice.Config) echo.MiddlewareFunc {
	const op = "middleware.Auth"

	// get token without "Bearer "  echo is delete berare then
	return mw.WithConfig(mw.Config{

		ContextKey: cfg.AuthMiddlewareContextKey,
		SigningKey: []byte(config.SignKey),
		// TODO - as sign method string to config...
		SigningMethod: "HS256",

		ErrorHandler: func(c echo.Context, err error) error {
			return c.JSON(http.StatusUnauthorized, map[string]string{
				"message": "لطفا ابتدا وارد حساب کاربری خود شوید",
			})
		},

		ParseTokenFunc: func(c echo.Context, auth string) (interface{}, error) {

			claims, err := service.ParseToken("Bearer " + auth)

			if err != nil {
				return nil, richerror.New(op).WithErr(err).WithMessage("dont create clamis")
			}

			return claims, nil
		},
	})
}
