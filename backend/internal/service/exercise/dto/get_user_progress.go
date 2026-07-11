package dto

type GetUserProgressRequest struct {
	// ExerciseID string `json:"exercise_id "`
	UserID     string `json:"user_id"`
	TraumaType string `json:"trauma_type"`
}

type GetUserProgressResponse struct {
	TotalExercises     int  `json:"total_exercises"`
	CompletedExercises int  `json:"completed_exercises"`
	ProgressPercent    int  `json:"progress_percent"`
	CompletedToday     bool `json:"completed_today"`
	// CanDoToday یعنی همین حالا یک تمرینِ باز برای انجام وجود دارد (نه قفل، نه تمام‌شده).
	CanDoToday bool `json:"can_do_today"`
	// NextAvailableDate وقتی تمرین امروز انجام شده و تمرین بعدی وجود دارد، تاریخ باز شدن بعدی (فردا) را می‌دهد.
	NextAvailableDate string `json:"next_available_date"`
}
