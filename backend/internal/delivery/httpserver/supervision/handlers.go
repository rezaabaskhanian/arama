package supervisionhandler

import (
	domainuser "aramina/internal/domain/user"
	"aramina/internal/pkg/claims"
	"aramina/internal/pkg/richerror"
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

// staffOnly فقط ادمین و روانشناس (therapist) اجازه‌ی دسترسی به پنل نظارت دارند
func (h Handler) staffOnly(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		cl, err := claims.GetClaims(c)
		if err != nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{"message": "احراز هویت ناموفق"})
		}
		if cl.Role != domainuser.RoleAdmin && cl.Role != domainuser.RoleTherapist {
			return c.JSON(http.StatusForbidden, map[string]string{"message": "دسترسی فقط برای روانشناس یا ادمین"})
		}
		return next(c)
	}
}

func (h Handler) GetStatus(c echo.Context) error {
	const op = "supervisionhandler.GetStatus"
	cl, err := claims.GetClaims(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "احراز هویت ناموفق"})
	}
	res, err := h.supervisionSvc.GetStatus(context.Background(), cl.UserID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": richerror.New(op).WithErr(err).Message()})
	}
	return c.JSON(http.StatusOK, res)
}

func (h Handler) Toggle(c echo.Context) error {
	const op = "supervisionhandler.Toggle"
	cl, err := claims.GetClaims(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "احراز هویت ناموفق"})
	}
	var req struct {
		Wants bool `json:"wants"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "مشکل در دریافت ورودی"})
	}
	if err := h.supervisionSvc.ToggleSupervision(context.Background(), cl.UserID, req.Wants); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": richerror.New(op).WithErr(err).Message()})
	}
	return c.JSON(http.StatusOK, map[string]bool{"wants_supervision": req.Wants})
}

func (h Handler) MyMessages(c echo.Context) error {
	const op = "supervisionhandler.MyMessages"
	cl, err := claims.GetClaims(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "احراز هویت ناموفق"})
	}
	res, err := h.supervisionSvc.MessagesForUser(context.Background(), cl.UserID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": richerror.New(op).WithErr(err).Message()})
	}
	return c.JSON(http.StatusOK, res)
}

func (h Handler) SendMyMessage(c echo.Context) error {
	const op = "supervisionhandler.SendMyMessage"
	cl, err := claims.GetClaims(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "احراز هویت ناموفق"})
	}
	var req struct {
		Body string `json:"body"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "مشکل در دریافت ورودی"})
	}
	if err := h.supervisionSvc.SendUserMessage(context.Background(), cl.UserID, req.Body); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": richerror.New(op).WithErr(err).Message()})
	}
	return c.JSON(http.StatusOK, map[string]bool{"success": true})
}

func (h Handler) ListSupervised(c echo.Context) error {
	const op = "supervisionhandler.ListSupervised"
	res, err := h.supervisionSvc.ListSupervised(context.Background())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": richerror.New(op).WithErr(err).Message()})
	}
	return c.JSON(http.StatusOK, res)
}

func (h Handler) UserMessages(c echo.Context) error {
	const op = "supervisionhandler.UserMessages"
	userID := c.Param("id")
	res, err := h.supervisionSvc.MessagesForUser(context.Background(), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": richerror.New(op).WithErr(err).Message()})
	}
	return c.JSON(http.StatusOK, res)
}

func (h Handler) SendMessage(c echo.Context) error {
	const op = "supervisionhandler.SendMessage"
	cl, err := claims.GetClaims(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "احراز هویت ناموفق"})
	}
	userID := c.Param("id")
	var req struct {
		Body   string `json:"body"`
		Urgent bool   `json:"urgent"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "مشکل در دریافت ورودی"})
	}
	if err := h.supervisionSvc.SendMessage(context.Background(), cl.UserID, userID, req.Body, req.Urgent); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": richerror.New(op).WithErr(err).Message()})
	}
	return c.JSON(http.StatusOK, map[string]bool{"success": true})
}

func (h Handler) RunFallback(c echo.Context) error {
	const op = "supervisionhandler.RunFallback"
	sent, err := h.supervisionSvc.RunDailyFallback(context.Background())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": richerror.New(op).WithErr(err).Message()})
	}
	return c.JSON(http.StatusOK, map[string]int{"sent": sent})
}
