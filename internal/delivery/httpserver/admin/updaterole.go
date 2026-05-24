package adminhandler

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// UpdateUserRole تغییر نقش کاربر
func (h Handler) UpdateUserRole(c echo.Context) error {
	userID := c.Param("id")

	var req struct {
		Role string `json:"role"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "ورودی نامعتبر است",
		})
	}

	if req.Role != "user" && req.Role != "admin" && req.Role != "helper" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"message": "نقش نامعتبر است",
		})
	}

	err := h.adminSvc.UpdateUserRole(c.Request().Context(), userID, req.Role)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "نقش کاربر با موفقیت تغییر کرد",
	})
}
