package crisisvalueobject

type TriggerType string

const (
	TriggerTest TriggerType = "test" //نمره تست بالا

	TriggerJournal  TriggerType = "journal"  // گلمات کلیدی یاددداشت
	TriggerMood     TriggerType = "mood"     // مود بد چند روز متوالی
	TriggerInactive TriggerType = "inactive" // عدم فعالیت طولانی

)

func (t TriggerType) String() string {
	switch t {
	case TriggerTest:
		return "نمره تست"
	case TriggerJournal:
		return "یادداشت"
	case TriggerMood:
		return "مود"
	case TriggerInactive:
		return "بی تمرینی"
	default:
		return "نامشخص"

	}
}
