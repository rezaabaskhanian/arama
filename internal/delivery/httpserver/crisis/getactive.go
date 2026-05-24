package crisishandler

import (
	"aramina/internal/pkg/claims"
	"net/http"

	"github.com/labstack/echo/v4"
)

// GetActiveCrisis گرفتن بحران فعال کاربر
func (h Handler) GetActiveCrisis(c echo.Context) error {
	const op = "crisishandler.GetActiveCrisis"

	claims, err := claims.GetClaims(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"message": "احراز هویت ناموفق",
		})
	}

	crisis, err := h.crisisSvc.GetActiveCrisis(c.Request().Context(), claims.UserID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": err.Error(),
		})
	}

	if crisis == nil {
		return c.JSON(http.StatusOK, map[string]interface{}{
			"has_crisis": false,
			"level":      0,
			"message":    "وضعیت عادی است",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"has_crisis":      true,
		"id":              string(crisis.ID),
		"level":           crisis.Level,
		"status":          crisis.Status,
		"triggered_by":    crisis.TriggeredBy,
		"message":         crisis.Message,
		"resources":       crisis.Resources,
		"created_at":      crisis.CreatedAt,
		"follow_up_count": crisis.FollowUpCount,
	})
}
