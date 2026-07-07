package dto

type QuestionResponse struct {
	ID    int    `json:"id"`
	Text  string `json:"text"`
	Order int    `json:"order"`
}

type GetAllQuestionsResponse struct {
	Total     int                `json:"total"`
	Questions []QuestionResponse `json:"questions"`
}
