package adminhandler

import (
	"aramina/internal/service/admin/dto"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) GetAllCommitmentTemplates(c echo.Context) error {
	list, err := h.adminSvc.ListCommitmentTemplates(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{"templates": list})
}

func (h Handler) CreateCommitmentTemplate(c echo.Context) error {
	var req dto.CreateCommitmentTemplateRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "ورودی نامعتبر است"})
	}
	res, err := h.adminSvc.CreateCommitmentTemplate(c.Request().Context(), req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": err.Error()})
	}
	return c.JSON(http.StatusCreated, res)
}

func (h Handler) UpdateCommitmentTemplate(c echo.Context) error {
	id := c.Param("id")
	var req dto.UpdateCommitmentTemplateRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "ورودی نامعتبر است"})
	}
	res, err := h.adminSvc.UpdateCommitmentTemplate(c.Request().Context(), id, req)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": err.Error()})
	}
	return c.JSON(http.StatusOK, res)
}

func (h Handler) DeleteCommitmentTemplate(c echo.Context) error {
	id := c.Param("id")
	if err := h.adminSvc.DeleteCommitmentTemplate(c.Request().Context(), id); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "تمرین حذف شد"})
}
