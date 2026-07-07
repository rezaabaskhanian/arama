package dto

type ResetPasswordRequest struct {
	Nickname string `json:"nickname"`
	Password string `json:"password"`
}

type RessetPasswordResponse struct {
	UserInfo UserInfo `json:"user"`
	Tokens   Tokens   `json:"tokens"`
}
