package commitmentservice

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/commitment/dto"
	"context"
	"time"
)

// ListTemplates فهرست الگوهای تمرین واقعی زندگی (لیست الگوها کش ۵ دقیقه‌ای است،
// اما وضعیت «باز بودن» برای هر کاربر جداگانه و بدون کش محاسبه می‌شود).
func (s Service) ListTemplates(ctx context.Context, userID string) (dto.TemplateListResponse, error) {
	const op = "commitmentservice.ListTemplates"

	var res dto.TemplateListResponse
	loaded := false

	// ابتدا لیست الگوها را از کش بخوان (داده‌ی سراسری و کم‌تغییر)
	if s.cache != nil {
		if cached, ok := s.cache.Get(templatesCacheKey); ok {
			if r, ok := cached.(dto.TemplateListResponse); ok {
				res = r
				loaded = true
			}
		}
	}

	if !loaded {
		templates, err := s.repo.ListActiveTemplates(ctx)
		if err != nil {
			return dto.TemplateListResponse{}, richerror.New(op).WithErr(err).WithMessage("خطا در دریافت تمرین‌ها")
		}

		out := make([]dto.TemplateInfo, 0, len(templates))
		for _, t := range templates {
			out = append(out, dto.TemplateInfo{
				ID:           string(t.ID),
				Title:        t.Title,
				Description:  t.Description,
				Category:     string(t.Category),
				Icon:         t.Icon,
				DurationHint: t.DurationHint,
			})
		}

		res = dto.TemplateListResponse{Templates: out}
		// فقط لیست الگوها کش می‌شود (بدون فیلدهای وابسته به کاربر)
		if s.cache != nil {
			s.cache.Set(templatesCacheKey, res, 5*time.Minute)
		}
	}

	// گِیت فعال‌سازی مخصوص همین کاربر (هرگز کش نمی‌شود)
	completed, err := s.repo.CountUserCompletedExercises(ctx, userID)
	if err != nil {
		return dto.TemplateListResponse{}, richerror.New(op).WithErr(err)
	}

	res.CompletedExercises = completed
	res.RequiredExercises = RequiredExercisesToUnlock
	res.Unlocked = completed >= RequiredExercisesToUnlock

	return res, nil
}
