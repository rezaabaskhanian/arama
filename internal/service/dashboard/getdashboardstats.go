package dashboardservice

import (
	"aramina/internal/pkg/richerror"
	"aramina/internal/service/dashboard/dto"
	dtoExercise "aramina/internal/service/exercise/dto"
	"context"
)

func (s Service) GetDashboardStats(ctx context.Context, userID string, traumaType string) (dto.DashboardStatsResponse, error) {
	const op = "dashboardservice.GetDashboardStats"

	reqExercise := dtoExercise.GetUserProgressRequest{
		UserID:     userID,
		TraumaType: traumaType,
	}

	userProgress, err := s.exerciseSvc.GetUserProgress(ctx, reqExercise)

	if err != nil {
		return dto.DashboardStatsResponse{}, richerror.New(op).WithErr(err)
	}

	journalEntries, _ := s.journalSvc.CountByUserID(ctx, userID)

	// 5. روزهای پیاپی
	streak, _ := s.journalSvc.GetCurrentStreak(ctx, userID)

	latestAssessment, err := s.assessmentSvc.GetAssessmentLatest(ctx, userID)
	lastAssessmentDate := ""
	traumaTypeAssessment := ""
	if err == nil {
		lastAssessmentDate = latestAssessment.CompletedAt.Format("2006/01/02")
		traumaTypeAssessment = latestAssessment.TraumaType
	}

	return dto.DashboardStatsResponse{
		TotalExercises:     userProgress.TotalExercises,
		CompletedExercises: userProgress.CompletedExercises,
		ProgressPercent:    float64(userProgress.ProgressPercent),
		JournalEntries:     journalEntries,
		Streak:             streak,
		LastAssessmentDate: lastAssessmentDate,
		TraumaType:         traumaTypeAssessment,
	}, nil

}
