package dto

type CrisisRequest struct {
	UserID      string `json:"user_id"`
	CurrentStep string `json:"current_step"`
	RiskLevel   string `json:"risk_level"`

	Result string `json:"result"`
}

type CrisisResponse struct {
	CrisisInfo CrisisInfo `json:"crisis_info"`
}
