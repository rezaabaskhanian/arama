// Package push پیام‌های نوتیفیکیشن را با Firebase Cloud Messaging می‌فرستد.
package push

import (
	"context"
	"fmt"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"google.golang.org/api/option"
)

// FCM یک فرستنده‌ی push مبتنی بر Firebase است.
type FCM struct {
	client *messaging.Client
}

// NewFCM کلاینت FCM را با فایل service-account می‌سازد. اگر credentialsFile خالی باشد
// (nil, nil) برمی‌گرداند تا در نبود پیکربندی، push بی‌سروصدا غیرفعال بماند.
func NewFCM(ctx context.Context, credentialsFile string) (*FCM, error) {
	if credentialsFile == "" {
		return nil, nil
	}

	opt := option.WithCredentialsFile(credentialsFile)
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		return nil, fmt.Errorf("error initializing firebase app: %w", err)
	}

	client, err := app.Messaging(ctx)
	if err != nil {
		return nil, fmt.Errorf("error initializing messaging client: %w", err)
	}

	return &FCM{client: client}, nil
}

// Push نوتیف را به چند token می‌فرستد و فهرست token‌های باطل‌شده را برمی‌گرداند
// تا صدازننده آن‌ها را از دیتابیس حذف کند.
func (f *FCM) Push(ctx context.Context, tokens []string, title, body string, data map[string]string) ([]string, error) {
	if f == nil || f.client == nil || len(tokens) == 0 {
		return nil, nil
	}

	android := &messaging.AndroidConfig{Priority: "high"}
	// پیام‌های اضطراری روی کانال crisis می‌روند (اهمیت بالا + عبور از حالت سکوت که
	// در سمت اپ روی همین کانال تنظیم شده). type از data خوانده می‌شود؛ بقیه روی
	// کانال پیش‌فرض (aramina_default) می‌مانند.
	if data["type"] == "crisis" {
		android.Notification = &messaging.AndroidNotification{ChannelID: "aramina_crisis"}
	}

	msg := &messaging.MulticastMessage{
		Tokens:       tokens,
		Notification: &messaging.Notification{Title: title, Body: body},
		Data:         data,
		Android:      android,
	}

	resp, err := f.client.SendEachForMulticast(ctx, msg)
	if err != nil {
		return nil, err
	}

	var invalid []string
	for i, r := range resp.Responses {
		if r.Success {
			continue
		}
		if messaging.IsUnregistered(r.Error) || messaging.IsRegistrationTokenNotRegistered(r.Error) {
			invalid = append(invalid, tokens[i])
		}
	}
	return invalid, nil
}
