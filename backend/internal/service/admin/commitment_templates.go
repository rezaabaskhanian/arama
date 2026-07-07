package adminservice

import (
	commitmentdomain "aramina/internal/domain/commitment"
	vo "aramina/internal/domain/commitment/valueobject"
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/admin/dto"
	"context"
)

func toTemplateInfo(t commitmentdomain.CommitmentTemplate) dto.CommitmentTemplateInfo {
	return dto.CommitmentTemplateInfo{
		ID:           string(t.ID),
		Title:        t.Title,
		Description:  t.Description,
		Category:     string(t.Category),
		Icon:         t.Icon,
		DurationHint: t.DurationHint,
		IsActive:     t.IsActive,
		OrderIndex:   t.OrderIndex,
	}
}

// ListCommitmentTemplates فهرست همه‌ی الگوها (فعال و غیرفعال)
func (s Service) ListCommitmentTemplates(ctx context.Context) ([]dto.CommitmentTemplateInfo, error) {
	const op = "adminservice.ListCommitmentTemplates"

	list, err := s.commitmentRepo.ListAllTemplates(ctx)
	if err != nil {
		return nil, richerror.New(op).WithErr(err).WithMessage("خطا در دریافت تمرین‌ها")
	}
	out := make([]dto.CommitmentTemplateInfo, 0, len(list))
	for _, t := range list {
		out = append(out, toTemplateInfo(t))
	}
	return out, nil
}

// CreateCommitmentTemplate ساخت الگوی جدید
func (s Service) CreateCommitmentTemplate(ctx context.Context, req dto.CreateCommitmentTemplateRequest) (dto.CommitmentTemplateInfo, error) {
	const op = "adminservice.CreateCommitmentTemplate"

	tmpl, err := commitmentdomain.NewCommitmentTemplate(
		req.Title, req.Description, vo.Category(req.Category), req.Icon, req.DurationHint, req.OrderIndex,
	)
	if err != nil {
		return dto.CommitmentTemplateInfo{}, richerror.New(op).WithErr(err).WithMessage(err.Error())
	}
	created, err := s.commitmentRepo.CreateTemplate(ctx, *tmpl)
	if err != nil {
		return dto.CommitmentTemplateInfo{}, richerror.New(op).WithErr(err).WithMessage("خطا در ساخت تمرین")
	}
	return toTemplateInfo(created), nil
}

// UpdateCommitmentTemplate به‌روزرسانی الگو
func (s Service) UpdateCommitmentTemplate(ctx context.Context, id string, req dto.UpdateCommitmentTemplateRequest) (dto.CommitmentTemplateInfo, error) {
	const op = "adminservice.UpdateCommitmentTemplate"

	tmpl, err := s.commitmentRepo.GetTemplateByID(ctx, id)
	if err != nil {
		return dto.CommitmentTemplateInfo{}, richerror.New(op).WithErr(err).WithMessage("تمرین یافت نشد")
	}
	if err := tmpl.Update(req.Title, req.Description, vo.Category(req.Category), req.Icon, req.DurationHint, req.OrderIndex, req.IsActive); err != nil {
		return dto.CommitmentTemplateInfo{}, richerror.New(op).WithErr(err).WithMessage(err.Error())
	}
	if err := s.commitmentRepo.UpdateTemplate(ctx, tmpl); err != nil {
		return dto.CommitmentTemplateInfo{}, richerror.New(op).WithErr(err).WithMessage("خطا در به‌روزرسانی تمرین")
	}
	return toTemplateInfo(tmpl), nil
}

// DeleteCommitmentTemplate حذف الگو
func (s Service) DeleteCommitmentTemplate(ctx context.Context, id string) error {
	const op = "adminservice.DeleteCommitmentTemplate"
	if err := s.commitmentRepo.DeleteTemplate(ctx, id); err != nil {
		return richerror.New(op).WithErr(err).WithMessage("خطا در حذف تمرین")
	}
	return nil
}
