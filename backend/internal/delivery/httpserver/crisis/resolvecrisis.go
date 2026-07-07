package crisishandler

import (
	"aramina/internal/pkg/claims"
	"net/http"

	"github.com/labstack/echo/v4"
)

// ResolveCrisis حل کردن بحران
func (h Handler) ResolveCrisis(c echo.Context) error {
	const op = "crisishandler.ResolveCrisis"

	// گرفتن ID از URL
	crisisID := c.Param("id")
	if crisisID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "شناسه بحران وارد نشده است",
		})
	}

	claims, err := claims.GetClaims(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"message": "احراز هویت ناموفق",
		})
	}

	err = h.crisisSvc.ResolveCrisis(c.Request().Context(), crisisID, claims.UserID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "بحران با موفقیت حل شد",
	})
}
