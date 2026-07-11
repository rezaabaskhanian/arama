package commitmenthandler

import (
	"aramina/internal/pkg/claims"
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/commitment/dto"
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) ListTemplates(c echo.Context) error {
	const op = "commitmenthandler.ListTemplates"

	cl, err := claims.GetClaims(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": "لطفا ابتدا وارد حساب کاربری خود شوید"})
	}

	res, err := h.commitmentSvc.ListTemplates(context.Background(), cl.UserID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
	}
	return c.JSON(http.StatusOK, res)
}

func (h Handler) ListMine(c echo.Context) error {
	const op = "commitmenthandler.ListMine"

	cl, err := claims.GetClaims(c)
	if err != nil {
		return richerror.New(op).WithErr(err)
	}

	res, err := h.commitmentSvc.ListMine(context.Background(), cl.UserID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
	}
	return c.JSON(http.StatusOK, res)
}

func (h Handler) Pledge(c echo.Context) error {
	const op = "commitmenthandler.Pledge"

	cl, err := claims.GetClaims(c)
	if err != nil {
		return richerror.New(op).WithErr(err)
	}

	var req dto.PledgeRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "داده‌های نامعتبر"})
	}

	res, err := h.commitmentSvc.Pledge(context.Background(), req, cl.UserID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": err.Error()})
	}
	return c.JSON(http.StatusCreated, res)
}

func (h Handler) Complete(c echo.Context) error {
	const op = "commitmenthandler.Complete"

	cl, err := claims.GetClaims(c)
	if err != nil {
		return richerror.New(op).WithErr(err)
	}

	id := c.Param("id")
	var req dto.CompleteRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "داده‌های نامعتبر"})
	}

	res, err := h.commitmentSvc.Complete(context.Background(), id, req, cl.UserID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": err.Error()})
	}
	return c.JSON(http.StatusOK, res)
}

func (h Handler) Cancel(c echo.Context) error {
	const op = "commitmenthandler.Cancel"

	cl, err := claims.GetClaims(c)
	if err != nil {
		return richerror.New(op).WithErr(err)
	}

	id := c.Param("id")
	if err := h.commitmentSvc.Cancel(context.Background(), id, cl.UserID); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "تعهد لغو شد"})
}
