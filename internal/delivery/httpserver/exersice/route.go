package exercisehandler

import "github.com/labstack/echo/v4"

func (h Handler) SetExerciseRoute(e *echo.Echo) {

	exerciseGroupe := e.Group("/exercise")
	exerciseGroupe.POST("/create", h.CreateExercise)
}
