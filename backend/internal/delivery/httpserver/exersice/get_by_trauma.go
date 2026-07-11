package exercisehandler

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/exercise/dto"
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) GetExerciseByTrauma(c echo.Context) error {
	const op = "exercisehandler.GetExerciseTrauma"

	traumaType := c.Param("traumaType")

	// احراز هویت اختیاری: اگر توکن معتبر ارسال شده باشد، userID را برای علامت‌گذاری
	// تمرین‌های تکمیل‌شده استخراج می‌کنیم؛ در غیر این صورت لیست عمومی برگردانده می‌شود.
	var userID string
	if authHeader := c.Request().Header.Get("Authorization"); authHeader != "" {
		if userClaims, err := h.authSvc.ParseToken(authHeader); err == nil && userClaims != nil {
			userID = userClaims.UserID
		}
	}

	req := dto.GetByTraumaTypeRequest{
		TraumaType: traumaType,
		UserID:     userID,
	}

	res, err := h.exerciseSvc.GetExercisByTraumaType(context.Background(), req)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": richerror.New(op).WithErr(err).Error(),
		})
	}

	return c.JSON(http.StatusOK, res)

}
