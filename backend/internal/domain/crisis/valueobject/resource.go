package crisisvalueobject

type ResourceType string

const (
	ResourceBreathingExercise ResourceType = "breathing_exercise" // تمرین تنفس
	ResourcePhoneNumber       ResourceType = "phone_number"       // شماره تلفن
	ResourceWebsite           ResourceType = "website"            // لینک وب‌سایت
	ResourceEmergency         ResourceType = "emergency"          // اورژانس
)

type CrisisResource struct {
	Type        ResourceType `json:"type"`
	Title       string       `json:"title"`
	Contact     string       `json:"contact"` // شماره یا لینک
	Description string       `json:"description"`
}

func NewPhoneResource(title, phone, description string) CrisisResource {
	return CrisisResource{
		Type:        ResourcePhoneNumber,
		Title:       title,
		Contact:     phone,
		Description: description,
	}
}

func NewBreathingExerciseResource() CrisisResource {
	return CrisisResource{
		Type:        ResourceBreathingExercise,
		Title:       "تمرین تنفس عمیق",
		Contact:     "",
		Description: "۵ ثانیه نفس بکش، ۵ ثانیه نگه دار، ۵ ثانیه بیرون بده. ۱۰ بار تکرار کن.",
	}
}
