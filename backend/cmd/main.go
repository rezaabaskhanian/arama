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
	postgresdevice "aramina/internal/repository/postgres/device"
	postgresexercise "aramina/internal/repository/postgres/exercise"
	postgresjournal "aramina/internal/repository/postgres/journal"
	postgressession "aramina/internal/repository/postgres/session"
	postgressupervision "aramina/internal/repository/postgres/supervision"
	postgresuser "aramina/internal/repository/postgres/user"
	adminservice "aramina/internal/service/admin"
	assessmentservice "aramina/internal/service/assessment"
	authservice "aramina/internal/service/auth"
	commitmentservice "aramina/internal/service/commitment"
	crisisservice "aramina/internal/service/crisis"
	dashboardservice "aramina/internal/service/dashboard"
	deviceservice "aramina/internal/service/device"
	exerciseservice "aramina/internal/service/exercise"
	journalservice "aramina/internal/service/journal"
	pushservice "aramina/internal/service/push"
	sessionservice "aramina/internal/service/session"
	supervisionservice "aramina/internal/service/supervision"
	userservice "aramina/internal/service/user"

	"context"
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

	authSvc, userSvc, crisisSvc, sessionSvc, journalSvc, exerciseSvc, assessmentSvc, dashboardSvc, adminSvc, commitmentSvc, supervisionSvc, deviceSvc := setupservice(cfg)

	// زمان‌بند پیام خودکار روانشناس: هر روز ساعت ۸ شبِ ایران، برای کاربرانِ تحت نظارتی
	// که هنوز پیامی نگرفته‌اند، سیستم پیام دلگرم‌کننده می‌فرستد.
	startSupervisionScheduler(supervisionSvc)

	server := httpserver.New(cfg, userSvc, authSvc, cfg.Auth, crisisSvc, sessionSvc, journalSvc,
		exerciseSvc, assessmentSvc, dashboardSvc, adminSvc, commitmentSvc, supervisionSvc, deviceSvc)

	server.Server()

}

// startSupervisionScheduler یک goroutine که هر روز ساعت ۲۰:۰۰ به‌وقت ایران پیام‌های خودکار را می‌فرستد.
func startSupervisionScheduler(svc supervisionservice.Service) {
	iranLoc := time.FixedZone("IRST", 12600) // UTC+03:30

	go func() {
		for {
			now := time.Now().In(iranLoc)
			// هدف: امروز ساعت ۲۰:۰۰
			next := time.Date(now.Year(), now.Month(), now.Day(), 20, 0, 0, 0, iranLoc)
			if !next.After(now) {
				// اگر از ۸ شب امروز گذشته، برای فردا برنامه‌ریزی کن
				next = next.Add(24 * time.Hour)
			}

			time.Sleep(time.Until(next))

			sent, err := svc.RunDailyFallback(context.Background())
			if err != nil {
				logger.L().Error("supervision fallback failed", "error", err.Error())
			} else {
				logger.L().Info("supervision fallback sent", "count", sent)
			}
		}
	}()
}

func setupservice(cfg config.Config) (authservice.Service, userservice.Service, crisisservice.Service, sessionservice.Service,
	journalservice.Service, exerciseservice.Service, assessmentservice.Service, dashboardservice.Service, adminservice.Service,
	commitmentservice.Service, supervisionservice.Service, deviceservice.Service) {

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

	// نوتیفیکیشن push: کلاینت FCM (اگر FCM_CREDENTIALS_FILE ست نباشد، push غیرفعال می‌ماند)
	DeviceRepo := postgresdevice.New(MyPostgresgresRepo.DB)
	fcm, err := pushservice.NewFCM(context.Background(), cfg.FCMCredentialsFile)
	if err != nil {
		logger.L().Error("fcm init failed; push disabled", "error", err.Error())
	}
	var pusher deviceservice.Pusher
	if fcm != nil {
		pusher = fcm
	}
	deviceSvc := deviceservice.New(DeviceRepo, pusher)

	SupervisionRepo := postgressupervision.New(MyPostgresgresRepo.DB)
	supervisionSvc := supervisionservice.New(SupervisionRepo, deviceSvc)

	return authSvc, userSvc, crisisSvc, sessionSvc, journalSvc, exerciseSvc, assessmentSvc, dashboardSvc, adminSvc, commitmentSvc, supervisionSvc, deviceSvc
}
