package crisisservice

import (
	domain "aramina/internal/domain/crisis"
	crisisvalueobject "aramina/internal/domain/crisis/valueobject"
	uservalueobject "aramina/internal/domain/user/valueobject"
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/crisis/dto"
	"context"
	"strings"
)

func (s Service) DetectAndCreateCrisis(ctx context.Context, req dto.DetectCrisisRequest) (*domain.Crisis, error) {
	const op = "crisisservice.DetectAndCreateCrisis"

	score := s.calculateCrisisScore(req)
	level := s.determineLevel(score)

	// اگر سطح 0 بود، nil برگردان (بدون بحران)
	if level == crisisvalueobject.LevelNone {
		return nil, nil
	}

	// تعیین عامل اصلی
	triggeredBy := s.determineTrigger(req)

	// چک کردن بحران فعال قبلی
	existingCrisis, err := s.repo.FindActiveByUserID(ctx, req.UserID)
	if err == nil && existingCrisis != nil {
		if existingCrisis.Level >= level {
			// سطح قبلی بالاتر یا برابر است → نیاز به بحران جدید نیست
			return nil, nil
		}
		// سطح جدید بالاتر است → بحران قبلی را resolve کن
		existingCrisis.Resolve()
		s.repo.Update(ctx, existingCrisis)
	}

	// ایجاد بحران جدید
	newCrisis := domain.NewCrisis(
		uservalueobject.UserID(req.UserID),
		level,
		triggeredBy,
		score,
	)

	// ذخیره در دیتابیس
	err = s.repo.Save(ctx, newCrisis)
	if err != nil {
		return nil, richerror.New(op).WithErr(err).WithMessage("خطا در ذخیره بحران")
	}

	return newCrisis, nil
}

func (s Service) calculateCrisisScore(req dto.DetectCrisisRequest) int {
	score := 0

	var points int

	switch {
	case req.TestScore > 50:
		points = 3
	case req.TestScore > 33:
		points = 2

	case req.TestScore > 20:
		points = 1

	default:
		points = 0

	}

	score += points

	dangerousKeywords := []string{
		"خودکشی", "میخوام بمیرم", "نمیخوام زندگی کنم",
		"به زندگی پایان بدم", "دیگه تحمل ندارم", "همه چیز تموم شده",
		"کاش میمردم", "زندگی بی ارزشه",
	}

	for _, kw := range dangerousKeywords {

		if strings.Contains(strings.ToLower(req.LatestJournal), strings.ToLower(kw)) {
			score += 3
			break
		}

	}

	// 3. مودهای اخیر (3 روز متوالی بد)
	if len(req.RecentMoods) >= 3 {
		badDays := 0
		for _, mood := range req.RecentMoods {
			if mood <= 2 {
				badDays++
			}
		}
		if badDays >= 3 {
			score += 2
		} else if badDays >= 2 {
			score += 1
		}
	}

	// 4. روزهای بدون تمرین
	if req.InactiveDays > 14 {
		score += 2
	} else if req.InactiveDays > 7 {
		score += 1
	}

	return score

}

func (s Service) determineLevel(score int) crisisvalueobject.CrisisLevel {

	switch {
	case score >= 5:
		return crisisvalueobject.LevelEmergency

	case score >= 3:
		return crisisvalueobject.LevelNeedHelp

	case score >= 1:
		return crisisvalueobject.LevelWarning

	default:
		return crisisvalueobject.LevelNone

	}

}

func (s Service) determineTrigger(req dto.DetectCrisisRequest) crisisvalueobject.TriggerType {
	// اولویت: یادداشت > تست > مود > بی‌تمرینی

	dangerousKeywords := []string{
		"خودکشی", "میخوام بمیرم", "نمیخوام زندگی کنم",
	}

	for _, kw := range dangerousKeywords {
		if strings.Contains(strings.ToLower(req.LatestJournal), strings.ToLower(kw)) {
			return crisisvalueobject.TriggerJournal
		}
	}

	if req.TestScore > 50 {
		return crisisvalueobject.TriggerTest
	}

	if len(req.RecentMoods) >= 3 {
		badDays := 0
		for _, mood := range req.RecentMoods {
			if mood <= 2 {
				badDays++
			}
		}
		if badDays >= 2 {
			return crisisvalueobject.TriggerMood
		}
	}

	if req.InactiveDays > 7 {
		return crisisvalueobject.TriggerInactive
	}

	return crisisvalueobject.TriggerTest

}
