package config

import (
	"aramina/internal/repository/postgres"
	auth "aramina/internal/service/auth"
)

type HttpServer struct {
	Port           int      `koanf:"port"`
	AllowedOrigins []string `koanf:"allowed_origins"`
}

type Config struct {
	MyPostgres postgres.Config `koanf:"mypostgres"`
	Auth       auth.Config     `koanf:"auth"`
	HttpServer HttpServer      `koanf:"http_server"`
	// FCMCredentialsFile مسیر فایل service-account فایربیس برای ارسال push.
	// خالی یعنی push غیرفعال است.
	FCMCredentialsFile string `koanf:"fcm_credentials_file"`
}
