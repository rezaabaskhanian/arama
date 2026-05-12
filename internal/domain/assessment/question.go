package assessment

type Question struct {
	ID    int    `json:"id"`
	Text  string `json:"text"`
	Order int    `json:"order"`
}
