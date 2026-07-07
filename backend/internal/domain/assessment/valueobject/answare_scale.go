package assessmentvalueobject

type AnswerScale int

func (s AnswerScale) Int() int {
	return int(s)
}

const (
	NotAtAll   AnswerScale = 0 // اصلا
	LittleBit  AnswerScale = 1 // کمی
	Moderately AnswerScale = 2 // متوسط
	QuiteBit   AnswerScale = 3 // خیلی
	Extremely  AnswerScale = 4 // فوق‌العاده زیاد
)

func (s AnswerScale) IsValid() bool {
	return s >= 0 && s <= 4
}
