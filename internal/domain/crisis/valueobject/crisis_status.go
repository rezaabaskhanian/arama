package crisisvalueobject

type CrisisStatus string

const (
	StatusDetected  CrisisStatus = "detected"  //تشخیص داده شده
	StatusNotified  CrisisStatus = "notified"  // هشدار داده شده
	StatusResolved  CrisisStatus = "resolved"  // حل شده
	StatusEscalated CrisisStatus = "escalated" // ارجاع داده شده
)

func (s CrisisStatus) String() string {

	switch s {
	case StatusDetected:
		return "تشخیص داده شده"
	case StatusNotified:
		return "هشدار داده شده"
	case StatusResolved:
		return "حل شده"
	case StatusEscalated:
		return "ارجاع داده شده"
	default:
		return "نامشخص"
	}
}

func (s CrisisStatus) IsValid() bool {

	switch s {
	case StatusDetected, StatusNotified, StatusResolved, StatusEscalated:
		return true
	default:
		return false

	}
}
