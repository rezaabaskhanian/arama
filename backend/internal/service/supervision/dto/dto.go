package dto

import "time"

type MessageDTO struct {
	ID         string    `json:"id"`
	Body       string    `json:"body"`
	SenderName string    `json:"sender_name"`
	IsAuto     bool      `json:"is_auto"`
	FromUser   bool      `json:"from_user"` // true یعنی خودِ کاربر این پیام را فرستاده (نه روانشناس/سیستم)
	CreatedAt  time.Time `json:"created_at"`
}

// StatusResponse وضعیت نظارت کاربر + پیام‌های او
type StatusResponse struct {
	WantsSupervision bool         `json:"wants_supervision"`
	Messages         []MessageDTO `json:"messages"`
}

// SupervisedUserDTO یک ردیف در پنل روانشناس
type SupervisedUserDTO struct {
	UserID        string     `json:"user_id"`
	Nickname      string     `json:"nickname"`
	Phone         string     `json:"phone"`
	LatestMood    int        `json:"latest_mood"`
	LastMessageAt *time.Time `json:"last_message_at"`
	MessageCount  int        `json:"message_count"`
}

type SupervisedListResponse struct {
	Users []SupervisedUserDTO `json:"users"`
}

type MessagesResponse struct {
	Messages []MessageDTO `json:"messages"`
}
