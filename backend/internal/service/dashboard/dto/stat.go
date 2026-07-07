package dto

type DashboardStatsResponse struct {
	TotalExercises     int     `json:"total_exercises"`
	CompletedExercises int     `json:"completed_exercises"`
	ProgressPercent    float64 `json:"progress_percent"`
	JournalEntries     int     `json:"journal_entries"`
	Streak             int     `json:"streak"`
	LastAssessmentDate string  `json:"last_assessment_date"`
	TraumaType         string  `json:"trauma_type"`
}
