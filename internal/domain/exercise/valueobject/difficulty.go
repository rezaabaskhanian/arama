package exercisevalueobject

type Difficulty string

const (
	DifficultyEasy   Difficulty = "easy"
	DifficultyMedium Difficulty = "medium"
	DifficultyHard   Difficulty = "hard"
)

func (d Difficulty) String() string {
	switch d {
	case DifficultyEasy:
		return "ساده"
	case DifficultyMedium:
		return "متوسط"
	case DifficultyHard:
		return "پیشرفته"
	default:
		return "نامشخص"
	}
}
