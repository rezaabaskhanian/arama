package httpserver

import (
	"aramina/internal/config"
	assessmenthandler "aramina/internal/delivery/httpserver/assessment"
	crisishandler "aramina/internal/delivery/httpserver/crisis"
	exercisehandler "aramina/internal/delivery/httpserver/exersice"
	journalhandler "aramina/internal/delivery/httpserver/journal"
	sessionhandler "aramina/internal/delivery/httpserver/session"
	userhandler "aramina/internal/delivery/httpserver/user"
	assessmentservice "aramina/internal/service/assessment"
	authservice "aramina/internal/service/auth"
	crisisservice "aramina/internal/service/crisis"
	exerciseservice "aramina/internal/service/exercise"
	journalservice "aramina/internal/service/journal"
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

	journalHandler journalhandler.Handler

	exerciseHandler exercisehandler.Handler

	assessmentHandler assessmenthandler.Handler
}

func New(cfg config.Config, userSvc userservice.Service, authSvc authservice.Service, authConfig authservice.Config,
	crisisSvc crisisservice.Service, sessionSvc sessionservice.Service, journalSvc journalservice.Service,
	exersiceSvc exerciseservice.Service, assessmentSvc assessmentservice.Service) Service {
	return Service{cfg: cfg, userHandler: userhandler.New(userSvc, authSvc, authConfig, cfg.Auth.SignKey),

		crisishandler: crisishandler.New(crisisSvc),

		sessionHandler: sessionhandler.New(sessionSvc, userSvc),

		journalHandler: journalhandler.New(journalSvc, userSvc),

		exerciseHandler: exercisehandler.New(exersiceSvc, authSvc, authConfig, cfg.Auth.SignKey),

		assessmentHandler: assessmenthandler.New(
			assessmentSvc, authSvc, authConfig, cfg.Auth.SignKey),
	}
}

func (s Service) Server() {

	e := echo.New()

	// for debug error

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{
			"http://localhost:3000",
			"http://localhost:3001",
		},
		AllowMethods: []string{
			echo.GET,
			echo.POST,
			echo.PUT,
			echo.DELETE,
			echo.OPTIONS,
		},
		AllowHeaders: []string{
			echo.HeaderOrigin,
			echo.HeaderContentType,
			echo.HeaderAccept,
			echo.HeaderAuthorization,
		},
		AllowCredentials: true,
	}))

	e.Use(middleware.Logger())

	e.Use(middleware.Recover())

	// e.GET("/Health", s.health)

	s.userHandler.SetUserRoutes(e)

	s.crisishandler.SetCrisisRoutes(e)

	s.journalHandler.SetJournalRoutes(e)

	s.exerciseHandler.SetExerciseRoute(e)

	s.assessmentHandler.SetAssessmentRoute(e)

	// s.commitmentHandler.SetCommitmentRoute(e)

	e.Logger.Fatal(e.Start(fmt.Sprintf(":%d", s.cfg.HttpServer.Port)))

}
