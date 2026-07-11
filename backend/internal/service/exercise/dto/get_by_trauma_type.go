package dto

type GetByTraumaTypeRequest struct {
	TraumaType string `json:"trauma_type"`
	UserID     string `json:"user_id"`
}

type GetByTraumaTypeResponse struct {
	ExerciseInfo ExerciseInfo `json:"exercise_info"`
}
