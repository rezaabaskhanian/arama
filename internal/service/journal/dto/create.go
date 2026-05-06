package dto

type JournalCreateRequest struct {
	Content string `json:"content"`
	Mood    int    `json:"mood"`
}

type JournalCreateResponse struct {
	JournalInfo JournalInfo `json:"journal_info"`
}
