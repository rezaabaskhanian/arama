package journalhandler

import "github.com/labstack/echo/v4"

func (h Handler) SetJournalRoutes(e *echo.Echo) {

	journalGroup := e.Group("/journal")

	journalGroup.POST("/create", h.CreateJournal)

}
