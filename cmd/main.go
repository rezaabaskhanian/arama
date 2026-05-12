package main

import (
	"aramina/internal/config"
	"aramina/internal/delivery/httpserver"

	"aramina/internal/repository/postgres"
	postgresassessment "aramina/internal/repository/postgres/assessment"
	postgrescrisis "aramina/internal/repository/postgres/crisis"
	postgresexercise "aramina/internal/repository/postgres/exercise"
	postgresjournal "aramina/internal/repository/postgres/journal"
	postgressession "aramina/internal/repository/postgres/session"
	postgresuser "aramina/internal/repository/postgres/user"
	assessmentservice "aramina/internal/service/assessment"
	authservice "aramina/internal/service/auth"
	crisisservice "aramina/internal/service/crisis"
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
	cfg := config.Config{

		MyPostgres: postgres.Config{
			UserName: "reza_abasi",
			Password: "r1367R1367",
			Port:     5431,
			Host:     "localhost",
			DBName:   "mental_health_db",
		},
		Auth: authservice.Config{
			SignKey:               JwtSignKey,
			AccessExpirationTime:  AccessTokenExpirationDuration,
			RefreshExpirationTime: RefreshTokenExpirationDuration,

			AccessSubject:  AccessTokenSubject,
			RefreshSubject: RefreshTokenSubject,
		},
		HttpServer: config.HttpServer{Port: 8086},
	}

	authSvc, userSvc, crisisSvc, sessionSvc, journalSvc, exerciseSvc, assessmentSvc := setupservice(cfg)

	server := httpserver.New(cfg, userSvc, authSvc, cfg.Auth, crisisSvc, sessionSvc, journalSvc, exerciseSvc, assessmentSvc)

	server.Server()

}

func setupservice(cfg config.Config) (authservice.Service, userservice.Service, crisisservice.Service, sessionservice.Service,
	journalservice.Service, exerciseservice.Service, assessmentservice.Service) {

	authSvc := authservice.New(cfg.Auth)

	MyPostgresgresRepo := postgres.New(cfg.MyPostgres)

	UserRepo := postgresuser.New(MyPostgresgresRepo.DB)

	CrisisRepo := postgrescrisis.New(MyPostgresgresRepo.DB)

	SessionRepo := postgressession.New(MyPostgresgresRepo.DB)

	JournalRepo := postgresjournal.New(MyPostgresgresRepo.DB)

	ExerciseRepo := postgresexercise.New(MyPostgresgresRepo.DB)

	AssessmentRepo := postgresassessment.New(MyPostgresgresRepo.DB)

	userSvc := userservice.New(UserRepo, authSvc)

	crisisSvc := crisisservice.New(CrisisRepo)

	sessionSvc := sessionservice.New(SessionRepo, userSvc)

	journalSvc := journalservice.New(JournalRepo, userSvc)

	exerciseSvc := exerciseservice.New(ExerciseRepo, userSvc)

	assessmentSvc := assessmentservice.New(AssessmentRepo, userSvc)

	return authSvc, userSvc, crisisSvc, sessionSvc, journalSvc, exerciseSvc, assessmentSvc
}
