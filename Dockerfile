# -----------------------------
# مرحله اول: Build کردن برنامه
# -----------------------------
    FROM golang:1.24-alpine AS builder

    # فعال کردن ماژول‌ها
    ENV GO111MODULE=on
    
    # تنظیم دایرکتوری کار
    WORKDIR /app
    
    # فقط go.mod و go.sum را کپی می‌کنیم تا کش حفظ شود
    COPY go.mod go.sum ./
    RUN go mod download
    
    # سپس بقیهٔ پروژه را کپی می‌کنیم
    COPY . .
    
    # بیلد برای سیستم لینوکسی
    RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main ./cmd/main.go
    
    
    # -----------------------------
    # مرحله دوم: ساخت ایمیج سبک نهایی
    # -----------------------------
    FROM alpine:latest
    
    WORKDIR /root/
    
    # فایل برنامه را از مرحله قبلی کپی کن
    COPY --from=builder /app/main .
    
    # پورت نهایی برنامه
    EXPOSE 8080
    
    # اجرای برنامه
    CMD ["./main"]
    