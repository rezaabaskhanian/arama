package commitmentservice

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/commitment/dto"
	"context"
	"time"
)

// ListTemplates فهرست الگوهای تمرین واقعی زندگی (با کش ۵ دقیقه‌ای)
func (s Service) ListTemplates(ctx context.Context) (dto.TemplateListResponse, error) {
	const op = "commitmentservice.ListTemplates"

	// ابتدا از کش بخوان (کاهش فشار روی دیتابیس برای داده‌ی پرتکرار و کم‌تغییر)
	if s.cache != nil {
		if cached, ok := s.cache.Get(templatesCacheKey); ok {
			if res, ok := cached.(dto.TemplateListResponse); ok {
				return res, nil
			}
		}
	}

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

	res := dto.TemplateListResponse{Templates: out}
	if s.cache != nil {
		s.cache.Set(templatesCacheKey, res, 5*time.Minute)
	}
	return res, nil
}
