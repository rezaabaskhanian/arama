package dto

type CrisisInfo struct {
	ID string `json:"id"` // UserID as string

	UserID      string `json:"user_id"`
	CurrentStep string `json:"current_step"`
	RiskLevel   string `json:"risk_level"`

	Result string `json:"result"`
}
