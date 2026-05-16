package journalhandler

import (
	"aramina/internal/delivery/middlware"

	"github.com/labstack/echo/v4"
)

func (h Handler) SetJournalRoutes(e *echo.Echo) {

	journalGroup := e.Group("/journal")

	journalGroup.POST("/create", h.CreateJournal)

	journalGroup.GET("/user/:limit/:offset", h.GetUserJournals, middlware.Auth(h.authSvc, h.authConfig))

	journalGroup.PUT("/update", h.UpdateJournal, middlware.Auth(h.authSvc, h.authConfig))

	journalGroup.DELETE("/delete/:id", h.DeleteJournal, middlware.Auth(h.authSvc, h.authConfig))

}
