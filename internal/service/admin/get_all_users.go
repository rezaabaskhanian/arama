package adminservice

import (
	"aramina/internal/service/admin/dto"
	"context"
)

// GetAllUsers گرفتن همه کاربران (با صفحه‌بندی)
// GetAllUsers گرفتن همه کاربران (با صفحه‌بندی)
func (s Service) GetAllUsers(ctx context.Context, page, pageSize int) ([]dto.UserInfo, int, error) {
	offset := (page - 1) * pageSize

	users, err := s.userRepo.FindAll(ctx, pageSize, offset)
	if err != nil {
		return nil, 0, err
	}

	total, err := s.userRepo.Count(ctx)
	if err != nil {
		return nil, 0, err
	}

	result := make([]dto.UserInfo, len(users))
	for i, u := range users {
		result[i] = dto.UserInfo{
			ID:       string(u.ID),
			Nickname: u.NickName,
			Phone:    u.Phone,
			// Email:     u.Email,
			Role:      u.Role,
			CreatedAt: u.CreatedAt,
		}
	}

	return result, total, nil
}
