package assessmentvalueobject

type TraumaType string

const (
	TraumaMild     TraumaType = "mild"     // خفیف
	TraumaModerate TraumaType = "moderate" // متوسط
	TraumaSevere   TraumaType = "severe"   // شدید
	TraumaComplex  TraumaType = "complex"  // پیچیده
)

func (t TraumaType) String() string {
	switch t {
	case TraumaMild:
		return "ترومای خفیف"
	case TraumaModerate:
		return "ترومای متوسط"
	case TraumaSevere:
		return "ترومای شدید"
	case TraumaComplex:
		return "ترومای پیچیده"
	default:
		return "نامشخص"
	}
}
