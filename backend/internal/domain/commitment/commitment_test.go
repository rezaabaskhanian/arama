package commitment

import (
	vo "aramina/internal/domain/commitment/valueobject"
	uservalueobject "aramina/internal/domain/user/valueobject"
	"testing"
)

func TestNewUserCommitment(t *testing.T) {
	uid := uservalueobject.UserID("u1")

	t.Run("عنوان خالی باید خطا بدهد", func(t *testing.T) {
		_, err := NewUserCommitment(uid, "", "", vo.CategoryFamily, 0)
		if err == nil {
			t.Fatal("انتظار خطا برای عنوان خالی داشتیم")
		}
	})

	t.Run("دسته‌بندی نامعتبر به community پیش‌فرض می‌شود", func(t *testing.T) {
		uc, err := NewUserCommitment(uid, "", "دیدار خانواده", vo.Category("bogus"), 3)
		if err != nil {
			t.Fatalf("خطای غیرمنتظره: %v", err)
		}
		if uc.Category != vo.CategoryCommunity {
			t.Fatalf("انتظار community داشتیم، دریافت شد: %s", uc.Category)
		}
		if uc.Status != vo.StatusPledged {
			t.Fatalf("وضعیت اولیه باید pledged باشد")
		}
	})

	t.Run("mood_before نامعتبر خطا می‌دهد", func(t *testing.T) {
		if _, err := NewUserCommitment(uid, "", "x", vo.CategoryTravel, 9); err == nil {
			t.Fatal("انتظار خطا برای mood نامعتبر داشتیم")
		}
	})
}

func TestUserCommitment_Complete(t *testing.T) {
	uid := uservalueobject.UserID("u1")
	uc, _ := NewUserCommitment(uid, "", "سفر", vo.CategoryTravel, 2)

	t.Run("mood_after نامعتبر", func(t *testing.T) {
		if err := uc.Complete(0, "خوب بود"); err == nil {
			t.Fatal("انتظار خطا برای mood_after نامعتبر داشتیم")
		}
	})

	t.Run("انجام موفق و محاسبه‌ی delta", func(t *testing.T) {
		if err := uc.Complete(5, "عالی بود"); err != nil {
			t.Fatalf("خطای غیرمنتظره: %v", err)
		}
		if uc.Status != vo.StatusCompleted {
			t.Fatal("وضعیت باید completed باشد")
		}
		if uc.CompletedAt == nil {
			t.Fatal("زمان انجام باید ثبت شود")
		}
		if got := uc.MoodDelta(); got != 3 { // 5 - 2
			t.Fatalf("انتظار delta=3 داشتیم، دریافت شد: %d", got)
		}
	})

	t.Run("انجام دوباره خطا می‌دهد", func(t *testing.T) {
		if err := uc.Complete(4, "دوباره"); err == nil {
			t.Fatal("انجام دوباره‌ی تعهد کامل‌شده باید خطا بدهد")
		}
	})
}

func TestUserCommitment_Cancel(t *testing.T) {
	uid := uservalueobject.UserID("u1")

	done, _ := NewUserCommitment(uid, "", "x", vo.CategoryFamily, 0)
	_ = done.Complete(3, "")
	if err := done.Cancel(); err == nil {
		t.Fatal("لغو تعهد انجام‌شده باید خطا بدهد")
	}

	pledged, _ := NewUserCommitment(uid, "", "y", vo.CategoryFamily, 0)
	if err := pledged.Cancel(); err != nil {
		t.Fatalf("لغو تعهد در انتظار نباید خطا بدهد: %v", err)
	}
	if pledged.Status != vo.StatusCancelled {
		t.Fatal("وضعیت باید cancelled باشد")
	}
}
