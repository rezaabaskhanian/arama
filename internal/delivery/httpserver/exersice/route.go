package exercisehandler

import (
	"aramina/internal/delivery/middlware"

	"github.com/labstack/echo/v4"
)

func (h Handler) SetExerciseRoute(e *echo.Echo) {

	exerciseGroupe := e.Group("/exercise")

	exerciseGroupe.POST("/create", h.CreateExercise)

	exerciseGroupe.GET("/by-trauma/:traumaType", h.GetExerciseByTrauma)

	exerciseGroupe.GET("/by-id/:exerciseID", h.GetExerciseByID)

	exerciseGroupe.POST("/compelete", h.GetExerciseByID, middlware.Auth(h.authSvc, h.authConfig))

	exerciseGroupe.GET("/user_progress", h.GetUserProgress, middlware.Auth(h.authSvc, h.authConfig))
}
