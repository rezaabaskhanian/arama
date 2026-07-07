package crisishandler

import (
	"aramina/internal/pkg/claims"
	"aramina/internal/pkg/richerror"
	dtoAssessment "aramina/internal/service/assessment/dto"
	"aramina/internal/service/crisis/dto"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) CheckCrisis(c echo.Context) error {
	const op = "crisishandler.CheckCrisis"

	claims, err := claims.GetClaims(c)
	if err != nil {
		return richerror.New(op).WithErr(err)
	}

	ctx := c.Request().Context()

	// 1. اول چک کن بحران فعال وجود دارد؟
	activeCrisis, err := h.crisisSvc.GetActiveCrisis(ctx, claims.UserID)
	if err != nil {
		return err
	}

	// 2. اگر بحران فعال وجود دارد، همان را برگردان (بدون ایجاد بحران جدید)
	if activeCrisis != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{
			"level":        activeCrisis.Level,
			"message":      activeCrisis.Message,
			"resources":    activeCrisis.Resources,
			"has_crisis":   true,
			"triggered_by": activeCrisis.TriggeredBy,
		})
	}

	// 3. اگر بحران فعال وجود ندارد، داده‌ها را جمع‌آوری کن
	testScore, err := h.assessmentSvc.GetAssessmentLatest(ctx, claims.UserID)
	if err != nil {
		testScore = dtoAssessment.AssessmentResultResponse{TotalScore: 0}
	}

	recentMoods, _ := h.journalSvc.GetRecentMoods(ctx, claims.UserID, 5)
	latestJournal, _ := h.journalSvc.GetLatestJournalContent(ctx, claims.UserID)
	inactiveDays, _ := h.exerciseSvc.GetInactiveDays(ctx, claims.UserID)

	req := dto.DetectCrisisRequest{
		UserID:        claims.UserID,
		TestScore:     testScore.TotalScore,
		RecentMoods:   recentMoods,
		LatestJournal: latestJournal,
		InactiveDays:  inactiveDays,
	}

	// 4. بحران جدید ایجاد کن
	newCrisis, err := h.crisisSvc.DetectAndCreateCrisis(ctx, req)
	if err != nil {
		return err
	}

	if newCrisis == nil {
		return c.JSON(http.StatusOK, map[string]interface{}{
			"level":      0,
			"message":    "وضعیت عادی است",
			"has_crisis": false,
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"level":        newCrisis.Level,
		"message":      newCrisis.Message,
		"resources":    newCrisis.Resources,
		"has_crisis":   true,
		"triggered_by": newCrisis.TriggeredBy,
	})
}
