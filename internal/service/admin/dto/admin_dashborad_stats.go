package dto

import "time"

type AdminDashboardStats struct {
	TotalUsers       int `json:"total_users"`
	TotalExercises   int `json:"total_exercises"`
	TotalAssessments int `json:"total_assessments"`
	// UsersInCrisis    int `json:"users_in_crisis"`
}

type UserInfo struct {
	ID        string    `json:"id"`
	Nickname  string    `json:"nickname"`
	Phone     string    `json:"phone"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

type ExerciseInfo struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	TraumaType  string    `json:"trauma_type"`
	Duration    int       `json:"duration"`
	Order       int       `json:"order"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
}

type CreateExerciseRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	TraumaType  string `json:"trauma_type"`
	Duration    int    `json:"duration"`
	Order       int    `json:"order"`
}

type UpdateExerciseRequest struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	MediaURL    string `json:"media_url"`
	TraumaType  string `json:"trauma_type"`
	Duration    int    `json:"duration"`
	Order       int    `json:"order"`
	IsActive    bool   `json:"is_active"`
}
