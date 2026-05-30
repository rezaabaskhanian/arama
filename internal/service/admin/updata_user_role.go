package adminservice

import (
	"context"
)

// UpdateUserRole تغییر نقش کاربر
func (s Service) UpdateUserRole(ctx context.Context, userID, role string) error {
	return s.userRepo.UdateRole(ctx, userID, role)
}
