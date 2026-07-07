package assessment

import (
	"encoding/json"
	"errors"
	"os"
	"sync"
)

type QuestionsData struct {
	Questions []Question `json:"questions"`
}

var (
	questionsMu     sync.Mutex
	cachedQuestions *QuestionsData
)

// loadQuestionsFromJSON بارگذاری سوالات از فایل JSON با کش امن.
// نکته: کش فقط در صورت موفقیت پر می‌شود؛ در صورت خطا (مثلاً مسیر اشتباه)
// حالت خراب کش نمی‌شود تا با اصلاح مسیر بتوان دوباره تلاش کرد.
func loadQuestionsFromJSON(filePath string) (*QuestionsData, error) {
	questionsMu.Lock()
	defer questionsMu.Unlock()

	if cachedQuestions != nil {
		return cachedQuestions, nil
	}

	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var data QuestionsData
	if err := json.NewDecoder(file).Decode(&data); err != nil {
		return nil, err
	}
	if len(data.Questions) == 0 {
		return nil, errors.New("فایل سوالات خالی است یا خوانده نشد")
	}

	cachedQuestions = &data
	return cachedQuestions, nil
}

// GetAllQuestions برگرداندن همه سوالات
func GetAllQuestions(filePath string) ([]Question, error) {
	data, err := loadQuestionsFromJSON(filePath)
	if err != nil {
		return nil, err
	}
	if data == nil {
		return nil, errors.New("سوالات در دسترس نیست")
	}
	return data.Questions, nil
}
