package adminservice

import (
	domainuser "aramina/internal/domain/user"
	"context"
	"errors"
)

// UpdateUserRole تغییر نقش کاربر. فقط نقش‌های شناخته‌شده (user/therapist/admin) پذیرفته می‌شوند.
func (s Service) UpdateUserRole(ctx context.Context, userID, role string) error {
	if !domainuser.ValidRole(role) {
		return errors.New("نقش نامعتبر است")
	}
	return s.userRepo.UdateRole(ctx, userID, role)
}
