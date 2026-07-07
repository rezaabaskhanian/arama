package main

import (
	"aramina/internal/config"
	"aramina/internal/delivery/httpserver"
	"aramina/internal/pkg/cache"
	"aramina/internal/pkg/logger"

	"aramina/internal/repository/migrator"
	"aramina/internal/repository/postgres"
	postgresassessment "aramina/internal/repository/postgres/assessment"
	postgrescommitment "aramina/internal/repository/postgres/commitment"
	postgrescrisis "aramina/internal/repository/postgres/crisis"
	postgresexercise "aramina/internal/repository/postgres/exercise"
	postgresjournal "aramina/internal/repository/postgres/journal"
	postgressession "aramina/internal/repository/postgres/session"
	postgresuser "aramina/internal/repository/postgres/user"
	adminservice "aramina/internal/service/admin"
	assessmentservice "aramina/internal/service/assessment"
	authservice "aramina/internal/service/auth"
	commitmentservice "aramina/internal/service/commitment"
	crisisservice "aramina/internal/service/crisis"
	dashboardservice "aramina/internal/service/dashboard"
	exerciseservice "aramina/internal/service/exercise"
	journalservice "aramina/internal/service/journal"
	sessionservice "aramina/internal/service/session"
	userservice "aramina/internal/service/user"

	"time"
)

const (
	JwtSignKey = "jwt_token"

	AccessTokenSubject  = "as"
	RefreshTokenSubject = "rs"

	AccessTokenExpirationDuration  = time.Hour * 24
	RefreshTokenExpirationDuration = time.Hour * 24 * 7
)

func main() {
	// کانفیگ از متغیرهای محیطی (12-Factor) با مقادیر پیش‌فرض
	cfg := config.Load()

	logger.Init()

	// مهاجرت‌ها: در development خودکار، و در production فقط با فلگ RUN_MIGRATIONS=true
	// (migrationها با IF NOT EXISTS نوشته شده‌اند و اجرای دوباره امن است)
	migrator := migrator.New(cfg.MyPostgres)
	if !config.IsProduction() || config.RunMigrations() {
		migrator.Up()
	}

	logger.L().Info("server is starting", "port", cfg.HttpServer.Port, "production", config.IsProduction())

	authSvc, userSvc, crisisSvc, sessionSvc, journalSvc, exerciseSvc, assessmentSvc, dashboardSvc, adminSvc, commitmentSvc := setupservice(cfg)

	server := httpserver.New(cfg, userSvc, authSvc, cfg.Auth, crisisSvc, sessionSvc, journalSvc,
		exerciseSvc, assessmentSvc, dashboardSvc, adminSvc, commitmentSvc)

	server.Server()

}

func setupservice(cfg config.Config) (authservice.Service, userservice.Service, crisisservice.Service, sessionservice.Service,
	journalservice.Service, exerciseservice.Service, assessmentservice.Service, dashboardservice.Service, adminservice.Service,
	commitmentservice.Service) {

	authSvc := authservice.New(cfg.Auth)

	MyPostgresgresRepo := postgres.New(cfg.MyPostgres)

	UserRepo := postgresuser.New(MyPostgresgresRepo.DB)

	CrisisRepo := postgrescrisis.New(MyPostgresgresRepo.DB)

	SessionRepo := postgressession.New(MyPostgresgresRepo.DB)

	JournalRepo := postgresjournal.New(MyPostgresgresRepo.DB)

	ExerciseRepo := postgresexercise.New(MyPostgresgresRepo.DB)

	AssessmentRepo := postgresassessment.New(MyPostgresgresRepo.DB)

	userSvc := userservice.New(UserRepo, authSvc)

	crisisSvc := crisisservice.New(CrisisRepo, userSvc)

	sessionSvc := sessionservice.New(SessionRepo, userSvc)

	journalSvc := journalservice.New(JournalRepo, userSvc)

	exerciseSvc := exerciseservice.New(ExerciseRepo, userSvc)

	assessmentSvc := assessmentservice.New(AssessmentRepo, userSvc)

	dashboardSvc := dashboardservice.New(exerciseSvc, journalSvc, assessmentSvc)

	commitmentRepo := postgrescommitment.New(MyPostgresgresRepo.DB)

	adminSvc := adminservice.New(UserRepo, ExerciseRepo, AssessmentRepo, commitmentRepo)

	appCache := cache.NewMemory()

	commitmentSvc := commitmentservice.New(commitmentRepo, userSvc, appCache)

	return authSvc, userSvc, crisisSvc, sessionSvc, journalSvc, exerciseSvc, assessmentSvc, dashboardSvc, adminSvc, commitmentSvc
}
