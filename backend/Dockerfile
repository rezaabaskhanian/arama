# syntax=docker/dockerfile:1
# -----------------------------
# مرحله اول: Build کردن برنامه
# -----------------------------
    FROM golang:1.25-alpine AS builder

    ENV GO111MODULE=on

    WORKDIR /app

    COPY go.mod go.sum ./
    # cache mount نگه‌داری ماژول‌ها بین بیلدها؛ اگر دانلود نیمه‌کاره قطع شد، دفعه‌ی بعد ادامه می‌دهد
    RUN --mount=type=cache,target=/go/pkg/mod \
        go mod download

    COPY . .

    RUN --mount=type=cache,target=/go/pkg/mod \
        --mount=type=cache,target=/root/.cache/go-build \
        CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main ./cmd/main.go
    
    # -----------------------------
    # مرحله دوم: ساخت ایمیج سبک نهایی
    # -----------------------------
    FROM alpine:latest
    
    WORKDIR /root/
    
    COPY --from=builder /app/main .
    
    # کپی migrations (با مسیر کامل)
    COPY --from=builder /app/internal/repository/postgres/migrations ./migrations
    
    # کپی data (فایل‌های JSON)
    COPY --from=builder /app/data ./data

    # مسیرهای فایل داخل ایمیج (متناسب با محل کپی بالا)
    ENV MIGRATIONS_DIR=./migrations
    ENV QUESTIONS_FILE=./data/questions.json

    EXPOSE 8086

    CMD ["./main"]