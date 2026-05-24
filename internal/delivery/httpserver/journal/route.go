package journalhandler

import (
	"aramina/internal/delivery/middlware"

	"github.com/labstack/echo/v4"
)

func (h Handler) SetJournalRoutes(e *echo.Echo) {

	journalGroup := e.Group("/journal")

	journalGroup.POST("/create", h.CreateJournal, middlware.Auth(h.authSvc, h.authConfig))

	journalGroup.GET("/user", h.GetUserJournals, middlware.Auth(h.authSvc, h.authConfig))

	journalGroup.GET("/:id", h.GetJournalEntryByID, middlware.Auth(h.authSvc, h.authConfig))

	journalGroup.PUT("/:id", h.UpdateJournal, middlware.Auth(h.authSvc, h.authConfig))

	journalGroup.DELETE("/delete/:id", h.DeleteJournal, middlware.Auth(h.authSvc, h.authConfig))

	journalGroup.GET("/today-mood", h.TodayMood, middlware.Auth(h.authSvc, h.authConfig))

	journalGroup.POST("/upsert-mood-add", h.UpsertTodayMood, middlware.Auth(h.authSvc, h.authConfig))

}
