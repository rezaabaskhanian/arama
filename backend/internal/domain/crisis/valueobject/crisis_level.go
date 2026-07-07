package crisisvalueobject

type CrisisLevel int

const (
	LevelNone      CrisisLevel = 0 // عادی بدون بحران
	LevelWarning   CrisisLevel = 1 // هشدار - نیاز به توجه
	LevelNeedHelp  CrisisLevel = 2 // نیاز به کمک - تماس با خط بحران
	LevelEmergency CrisisLevel = 3 // اورژانس - اقدام فوری
)

func (l CrisisLevel) String() string {
	switch l {
	case LevelNone:
		return "عادی"
	case LevelWarning:
		return "هشدار"
	case LevelNeedHelp:
		return "نیاز به کمک"
	case LevelEmergency:
		return "اورژانس"
	default:
		return "نامشخص"
	}
}

func (l CrisisLevel) IsValid() bool {
	return l >= LevelNone && l <= LevelEmergency
}

func (l CrisisLevel) Color() string {
	switch l {
	case LevelNone:
		return "green"
	case LevelWarning:
		return "yellow"
	case LevelNeedHelp:
		return "orange"
	case LevelEmergency:
		return "red"
	default:
		return "gray"
	}
}
