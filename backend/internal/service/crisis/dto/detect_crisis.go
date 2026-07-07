package dto

type DetectCrisisRequest struct {
	UserID        string `json:"user_id"`
	TestScore     int    `json:"test_score"`     // نمره آخرین تست (0-80)
	RecentMoods   []int  `json:"recent_moods"`   // مودهای 5 روز اخیر (1-5)
	LatestJournal string `json:"latest_journal"` // آخرین یادداشت کاربر
	InactiveDays  int    `json:"inactive_days"`  // تعداد روزهای بدون تمرین
}
