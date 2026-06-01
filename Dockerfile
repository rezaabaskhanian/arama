# -----------------------------
# مرحله اول: Build کردن برنامه
# -----------------------------
    FROM golang:1.21-alpine AS builder

    ENV GO111MODULE=on
    
    WORKDIR /app
    
    COPY go.mod go.sum ./
    RUN go mod download
    
    COPY . .
    
    # بیلد با مسیر درست cmd/main.go
    RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main ./cmd/main.go
    
    # -----------------------------
    # مرحله دوم: ساخت ایمیج سبک نهایی
    # -----------------------------
    FROM alpine:latest
    
    WORKDIR /root/
    
    COPY --from=builder /app/main .
    
    # اگر migration و data داری (اختیاری)
    COPY --from=builder /app/migrations ./migrations 2>/dev/null || true
    COPY --from=builder /app/data ./data 2>/dev/null || true
    
    EXPOSE 8086
    
    CMD ["./main"]