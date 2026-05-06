package assessmentvalueobject

type AssessmentStatus string

const (
	StatusInProgress AssessmentStatus = "in_progress"
	StatusCompleted  AssessmentStatus = "completed"
	StatusExpired    AssessmentStatus = "expired"
)
