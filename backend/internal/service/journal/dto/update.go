package dto

type JournalUpdateRequest struct {
	JournalID string `json:"journal_id"`
	Content   string `json:"content"`
	Mood      int    `json:"mood"`
}

// type JournalCreateResponse struct {
// 	JournalInfo JournalInfo `json:"journal_info"`
// }
