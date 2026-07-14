package devicehandler

import (
	"aramina/internal/pkg/claims"
	"aramina/internal/pkg/richerror"
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

// RegisterDevice توکن FCM دستگاهِ کاربرِ لاگین‌کرده را ثبت می‌کند
func (h Handler) RegisterDevice(c echo.Context) error {
	const op = "devicehandler.RegisterDevice"

	cl, err := claims.GetClaims(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "احراز هویت ناموفق"})
	}

	var req struct {
		Token    string `json:"token"`
		Platform string `json:"platform"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "مشکل در دریافت ورودی"})
	}

	if err := h.deviceSvc.RegisterToken(context.Background(), cl.UserID, req.Token, req.Platform); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": richerror.New(op).WithErr(err).Message()})
	}

	return c.JSON(http.StatusOK, map[string]bool{"success": true})
}
