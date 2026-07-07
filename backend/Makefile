# ============================================================
# آرامینا — Makefile بک‌اند
# ============================================================
.DEFAULT_GOAL := help

APP_NAME := aramina
MAIN := ./cmd/main.go
BIN := ./bin/$(APP_NAME)

.PHONY: help
help: ## نمایش راهنما
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

.PHONY: run
run: ## اجرای سرور (development)
	go run $(MAIN)

.PHONY: build
build: ## ساخت باینری در bin/
	@mkdir -p bin
	go build -o $(BIN) $(MAIN)

.PHONY: test
test: ## اجرای همه‌ی تست‌ها
	go test ./... -count=1

.PHONY: test-cover
test-cover: ## اجرای تست‌ها با گزارش پوشش
	go test ./... -cover -coverprofile=coverage.out
	go tool cover -func=coverage.out | tail -1

.PHONY: vet
vet: ## بررسی استاتیک go vet
	go vet ./...

.PHONY: fmt
fmt: ## قالب‌بندی کد
	go fmt ./...

.PHONY: tidy
tidy: ## مرتب‌سازی وابستگی‌ها
	go mod tidy

.PHONY: lint
lint: fmt vet ## قالب‌بندی + بررسی استاتیک

.PHONY: migrate-up
migrate-up: ## اجرای مهاجرت‌ها (خودکار هنگام run در حالت غیرproduction)
	@echo "مهاجرت‌ها هنگام اجرای سرور در حالت development به‌صورت خودکار اعمال می‌شوند"

.PHONY: docker-up
docker-up: ## بالا آوردن سرویس‌ها با docker-compose
	docker-compose up -d

.PHONY: docker-down
docker-down: ## توقف سرویس‌های docker-compose
	docker-compose down

.PHONY: clean
clean: ## پاک‌سازی خروجی‌ها
	rm -rf bin coverage.out
