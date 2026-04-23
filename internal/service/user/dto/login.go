package dto

type LoginRequest struct {
	Nickname string `json:"nickname"`
	Password string `json:"password_hash"`
}

type LoginResponse struct {
	UserInfo UserInfo `json:"user"`
	Tokens   Tokens   `json:"tokens"`
}
