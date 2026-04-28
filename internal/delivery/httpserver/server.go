package httpserver

import (
	"aramina/internal/config"
	crisishandler "aramina/internal/delivery/httpserver/crisis"
	sessionhandler "aramina/internal/delivery/httpserver/session"
	userhandler "aramina/internal/delivery/httpserver/user"
	authservice "aramina/internal/service/auth"
	crisisservice "aramina/internal/service/crisis"
	sessionservice "aramina/internal/service/session"
	userservice "aramina/internal/service/user"
	"fmt"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Service struct {
	cfg           config.Config
	userHandler   userhandler.Handler
	crisishandler crisishandler.Handler

	sessionHandler sessionhandler.Handler
}

func New(cfg config.Config, userSvc userservice.Service, authSvc authservice.Service, authConfig authservice.Config,
	crisisSvc crisisservice.Service, sessionSvc sessionservice.Service) Service {
	return Service{cfg: cfg, userHandler: userhandler.New(userSvc, authSvc, authConfig, cfg.Auth.SignKey),
		crisishandler: crisishandler.New(crisisSvc), sessionHandler: sessionhandler.New(sessionSvc, userSvc)}
}

func (s Service) Server() {

	e := echo.New()
	e.Use(middleware.Logger())

	e.Use(middleware.Recover())

	// e.GET("/Health", s.health)

	s.userHandler.SetUserRoutes(e)

	s.crisishandler.SetCrisisRoutes(e)

	// s.commitmentHandler.SetCommitmentRoute(e)

	e.Logger.Fatal(e.Start(fmt.Sprintf(":%d", s.cfg.HttpServer.Port)))

}
