package dto

type GetUserProgressRequest struct {
	// ExerciseID string `json:"exercise_id "`
	UserID string `json:"user_id "`
}

type GetUserProgressResponse struct {
	TotalExercises     int `json:"total_exercises "`
	CompletedExercises int `json:"completed_exercises "`
	ProgressPercent    int `json:"progress_percent "`
}
