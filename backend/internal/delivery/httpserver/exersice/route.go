package exercisehandler

import (
	"aramina/internal/delivery/middlware"

	"github.com/labstack/echo/v4"
)

func (h Handler) SetExerciseRoute(e *echo.Echo) {

	exerciseGroupe := e.Group("/exercises")

	exerciseGroupe.POST("/create", h.CreateExercise)

	exerciseGroupe.GET("/by-trauma/:traumaType", h.GetExerciseByTrauma)

	exerciseGroupe.GET("/by-id/:exerciseID", h.GetExerciseByID)

	exerciseGroupe.POST("/:exerciseID/complete", h.CompletedExercises, middlware.Auth(h.authSvc, h.authConfig))

	exerciseGroupe.GET("/user_progress", h.GetUserProgress, middlware.Auth(h.authSvc, h.authConfig))
}
