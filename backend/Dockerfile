# # syntax=docker/dockerfile:1
# # -----------------------------
# # مرحله اول: Build کردن برنامه
# # -----------------------------
#     FROM golang:1.25-alpine AS builder

#     ENV GO111MODULE=on

#     WORKDIR /app

#     COPY go.mod go.sum ./
#     # cache mount نگه‌داری ماژول‌ها بین بیلدها؛ اگر دانلود نیمه‌کاره قطع شد، دفعه‌ی بعد ادامه می‌دهد
#     RUN --mount=type=cache,target=/go/pkg/mod \
#         go mod download

#     COPY . .

#     RUN --mount=type=cache,target=/go/pkg/mod \
#         --mount=type=cache,target=/root/.cache/go-build \
#         CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main ./cmd/main.go
    
#     # -----------------------------
#     # مرحله دوم: ساخت ایمیج سبک نهایی
#     # -----------------------------
#     FROM alpine:latest
    
#     WORKDIR /root/
    
#     COPY --from=builder /app/main .
    
#     # کپی migrations (با مسیر کامل)
#     COPY --from=builder /app/internal/repository/postgres/migrations ./migrations
    
#     # کپی data (فایل‌های JSON)
#     COPY --from=builder /app/data ./data

#     # مسیرهای فایل داخل ایمیج (متناسب با محل کپی بالا)
#     ENV MIGRATIONS_DIR=./migrations
#     ENV QUESTIONS_FILE=./data/questions.json

#     EXPOSE 8086

#     CMD ["./main"]


# syntax=docker/dockerfile:1

# -----------------------------
# Stage 1: Build
# -----------------------------
    FROM golang:1.25-alpine AS builder

    ENV GO111MODULE=on \
        GOPROXY=https://goproxy.cn,direct \
        GOSUMDB=sum.golang.org \
        CGO_ENABLED=0
    
    WORKDIR /app
    
    # ابزارهای مورد نیاز
    RUN apk add --no-cache git ca-certificates
    
    # تنظیم Go Proxy
    RUN go env -w GOPROXY=https://goproxy.cn,direct
    
    # دانلود وابستگی‌ها
    COPY go.mod go.sum ./
    
    RUN --mount=type=cache,target=/go/pkg/mod \
        --mount=type=cache,target=/root/.cache/go-build \
        go mod download
    
    # کپی سورس
    COPY . .
    
    # Build
    RUN --mount=type=cache,target=/go/pkg/mod \
        --mount=type=cache,target=/root/.cache/go-build \
        GOOS=linux GOARCH=amd64 \
        go build -o main ./cmd/main.go
    
    # -----------------------------
    # Stage 2: Runtime
    # -----------------------------
    FROM alpine:latest
    
    WORKDIR /root
    
    RUN apk add --no-cache ca-certificates tzdata
    
    COPY --from=builder /app/main .
    
    COPY --from=builder /app/internal/repository/postgres/migrations ./migrations
    COPY --from=builder /app/data ./data
    
    ENV MIGRATIONS_DIR=/root/migrations
    ENV QUESTIONS_FILE=/root/data/questions.json
    
    EXPOSE 8086
    
    CMD ["./main"]