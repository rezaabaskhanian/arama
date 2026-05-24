package adminhandler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

// GetAllUsers لیست همه کاربران
// GetAllUsers لیست همه کاربران (با صفحه‌بندی)
func (h Handler) GetAllUsers(c echo.Context) error {
	// گرفتن پارامترهای صفحه‌بندی از query string
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}

	users, total, err := h.adminSvc.GetAllUsers(c.Request().Context(), page, pageSize)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"users":       users,
		"total":       total,
		"page":        page,
		"page_size":   pageSize,
		"total_pages": (total + pageSize - 1) / pageSize,
	})
}
