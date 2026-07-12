package dto

type ResetPasswordRequest struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

type RessetPasswordResponse struct {
	UserInfo UserInfo `json:"user"`
	Tokens   Tokens   `json:"tokens"`
}
