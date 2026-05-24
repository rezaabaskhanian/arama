package crisishandler

import (
	"aramina/internal/pkg/claims"
	"aramina/internal/service/crisis/dto"
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
)

func (h Handler) CheckCrisis(c echo.Context) error {
	claims, _ := claims.GetClaims(c)

	ctx := context.Background()

	// جمع‌آوری داده‌ها از سرویس‌های دیگر
	testScore, _ := h.assessmentSvc.GetAssessmentLatest(ctx, claims.UserID)
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

	crisis, err := h.crisisSvc.DetectAndCreateCrisis(c.Request().Context(), req)
	if err != nil {
		return err
	}

	if crisis == nil {
		return c.JSON(http.StatusOK, map[string]interface{}{
			"level":   0,
			"message": "وضعیت عادی است",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"level":     crisis.Level,
		"message":   crisis.Message,
		"resources": crisis.Resources,
	})
}
