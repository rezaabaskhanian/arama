package dto

import assessmentvalueobject "aramina/internal/domain/assessment/valueobject"

type CreateExerciseRequest struct {
	Title       string
	Description string
	TraumaType  assessmentvalueobject.TraumaType
	MediaURL    string
	Duration    int
	Order       int
}

// type UpdateExerciseRequest struct {
//     ID          uuid.UUID
//     Title       string
//     Description string
//     MediaURL    string
//     Duration    int
//     Order       int
//     IsActive    bool
// }

// type CompleteExerciseRequest struct {
//     UserID     uuid.UUID
//     ExerciseID uuid.UUID
// }

// type RateExerciseRequest struct {
//     UserID     uuid.UUID
//     ExerciseID uuid.UUID
//     Rating     int  // 1 تا 5
// }

// type GetExercisesByTraumaRequest struct {
//     UserID     uuid.UUID
//     TraumaType assessmentvalueobject.TraumaType
// }

type CreateExerciseResponse struct {
	ExerciseInfo ExerciseInfo `json:"exercise_info"`
}
