package dto

type CommitmentTemplateInfo struct {
	ID           string `json:"id"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	Category     string `json:"category"`
	Icon         string `json:"icon"`
	DurationHint string `json:"duration_hint"`
	IsActive     bool   `json:"is_active"`
	OrderIndex   int    `json:"order_index"`
}

type CreateCommitmentTemplateRequest struct {
	Title        string `json:"title"`
	Description  string `json:"description"`
	Category     string `json:"category"`
	Icon         string `json:"icon"`
	DurationHint string `json:"duration_hint"`
	OrderIndex   int    `json:"order_index"`
}

type UpdateCommitmentTemplateRequest struct {
	Title        string `json:"title"`
	Description  string `json:"description"`
	Category     string `json:"category"`
	Icon         string `json:"icon"`
	DurationHint string `json:"duration_hint"`
	OrderIndex   int    `json:"order_index"`
	IsActive     bool   `json:"is_active"`
}
