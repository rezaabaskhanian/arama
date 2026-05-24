package adminservice

import (
	"aramina/internal/service/admin/dto"
	"context"
)

// GetDashboardStats آمار کلی برای پنل ادمین
func (s Service) GetDashboardStats(ctx context.Context) (*dto.AdminDashboardStats, error) {
	// تعداد کل کاربران
	totalUsers, _ := s.userRepo.Count(ctx)

	// تعداد کاربران فعال (اختیاری)
	// activeUsers, _ := s.userRepo.CountActive(ctx)

	// تعداد کل تمرین‌ها
	totalExercises, _ := s.exerciseRepo.CountAll(ctx)

	// تعداد کل تست‌ها
	totalAssessments, _ := s.assessmentRepo.CountAll(ctx)

	// تعداد کاربران در وضعیت بحران (اختیاری - بعداً اضافه می‌شود)
	// usersInCrisis, _ := s.crisisRepo.CountActive(ctx)

	return &dto.AdminDashboardStats{
		TotalUsers:       totalUsers,
		TotalExercises:   totalExercises,
		TotalAssessments: totalAssessments,
		// UsersInCrisis:    usersInCrisis,
	}, nil
}
