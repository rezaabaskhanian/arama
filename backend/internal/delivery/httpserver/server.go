package httpserver

import (
	"aramina/internal/config"
	adminhandler "aramina/internal/delivery/httpserver/admin"
	assessmenthandler "aramina/internal/delivery/httpserver/assessment"
	commitmenthandler "aramina/internal/delivery/httpserver/commitment"
	crisishandler "aramina/internal/delivery/httpserver/crisis"
	dashboardhandler "aramina/internal/delivery/httpserver/dashboard"
	exercisehandler "aramina/internal/delivery/httpserver/exersice"
	journalhandler "aramina/internal/delivery/httpserver/journal"
	sessionhandler "aramina/internal/delivery/httpserver/session"
	supervisionhandler "aramina/internal/delivery/httpserver/supervision"
	userhandler "aramina/internal/delivery/httpserver/user"
	adminservice "aramina/internal/service/admin"
	assessmentservice "aramina/internal/service/assessment"
	authservice "aramina/internal/service/auth"
	commitmentservice "aramina/internal/service/commitment"
	crisisservice "aramina/internal/service/crisis"
	dashboardservice "aramina/internal/service/dashboard"
	exerciseservice "aramina/internal/service/exercise"
	journalservice "aramina/internal/service/journal"
	sessionservice "aramina/internal/service/session"
	supervisionservice "aramina/internal/service/supervision"
	userservice "aramina/internal/service/user"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/time/rate"
)

type Service struct {
	cfg           config.Config
	userHandler   userhandler.Handler
	crisishandler crisishandler.Handler

	sessionHandler sessionhandler.Handler

	journalHandler journalhandler.Handler

	exerciseHandler exercisehandler.Handler

	assessmentHandler assessmenthandler.Handler

	dashboardHandler dashboardhandler.Handler

	adminHandler adminhandler.Handler

	commitmentHandler commitmenthandler.Handler

	supervisionHandler supervisionhandler.Handler
}

func New(cfg config.Config, userSvc userservice.Service, authSvc authservice.Service, authConfig authservice.Config,
	crisisSvc crisisservice.Service, sessionSvc sessionservice.Service, journalSvc journalservice.Service,
	exersiceSvc exerciseservice.Service, assessmentSvc assessmentservice.Service,
	dashboardSvc dashboardservice.Service, adminSvc adminservice.Service,
	commitmentSvc commitmentservice.Service, supervisionSvc supervisionservice.Service) Service {

	return Service{cfg: cfg, userHandler: userhandler.New(userSvc, authSvc, authConfig, cfg.Auth.SignKey),

		crisishandler: crisishandler.New(crisisSvc, assessmentSvc, journalSvc, exersiceSvc, authSvc, authConfig, cfg.Auth.SignKey),

		sessionHandler: sessionhandler.New(sessionSvc, userSvc),

		journalHandler: journalhandler.New(journalSvc, userSvc, authSvc, authConfig, cfg.Auth.SignKey),

		exerciseHandler: exercisehandler.New(exersiceSvc, authSvc, authConfig, cfg.Auth.SignKey),

		assessmentHandler: assessmenthandler.New(
			assessmentSvc, authSvc, authConfig, cfg.Auth.SignKey),

		dashboardHandler: dashboardhandler.New(dashboardSvc, authSvc, authConfig),

		adminHandler: adminhandler.New(adminSvc, authSvc, authConfig),

		commitmentHandler: commitmenthandler.New(commitmentSvc, authSvc, authConfig),

		supervisionHandler: supervisionhandler.New(supervisionSvc, authSvc, authConfig),
	}
}

func (s Service) Server() {

	e := echo.New()

	// for debug error

	allowedOrigins := s.cfg.HttpServer.AllowedOrigins
	if len(allowedOrigins) == 0 {
		allowedOrigins = []string{"http://localhost:3000", "http://localhost:3001"}
	}

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: allowedOrigins,
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

	// شناسه‌ی یکتای درخواست برای رهگیری در لاگ‌ها
	e.Use(middleware.RequestID())

	// لاگ ساخت‌یافته (structured) با slog
	e.Use(structuredLogger())

	e.Use(middleware.Recover())

	// محدودیت نرخ درخواست‌ها برای جلوگیری از سوءاستفاده/DDoS (۲۰ درخواست بر ثانیه به‌ازای هر IP)
	e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(rate.Limit(20))))

	// سلامت سرویس برای مانیتورینگ/Load Balancer
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})

	s.userHandler.SetUserRoutes(e)

	s.crisishandler.SetCrisisRoutes(e)

	s.journalHandler.SetJournalRoutes(e)

	s.exerciseHandler.SetExerciseRoute(e)

	s.assessmentHandler.SetAssessmentRoute(e)

	s.dashboardHandler.SetDashboardRoutes(e)

	s.adminHandler.SetAdminRoutes(e)

	s.commitmentHandler.SetCommitmentRoutes(e)

	s.supervisionHandler.SetSupervisionRoutes(e)

	e.Logger.Fatal(e.Start(fmt.Sprintf(":%d", s.cfg.HttpServer.Port)))

}
