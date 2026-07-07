package assessment

import (
	"encoding/json"
	"os"
	"sync"
)

type QuestionsData struct {
	Questions []Question `json:"questions"`
}

var (
	onceQuestions   sync.Once
	cachedQuestions *QuestionsData
)

// loadQuestionsFromJSON بارگذاری سوالات از فایل JSON با کش
func loadQuestionsFromJSON(filePath string) (*QuestionsData, error) {
	var data QuestionsData
	var err error

	onceQuestions.Do(func() {
		file, openErr := os.Open(filePath)
		if openErr != nil {
			err = openErr
			return
		}
		defer file.Close()

		decodeErr := json.NewDecoder(file).Decode(&data)
		if decodeErr != nil {
			err = decodeErr
			return
		}
		cachedQuestions = &data
	})

	if err != nil {
		return nil, err
	}
	return cachedQuestions, nil
}

// GetAllQuestions برگرداندن همه سوالات
func GetAllQuestions(filePath string) ([]Question, error) {
	data, err := loadQuestionsFromJSON(filePath)
	if err != nil {
		return nil, err
	}
	return data.Questions, nil
}
