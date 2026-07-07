package dto

type GetByTraumaTypeRequest struct {
	TraumaType string `json:"trauma_type "`
}

type GetByTraumaTypeResponse struct {
	ExerciseInfo ExerciseInfo `json:"exercise_info"`
}
