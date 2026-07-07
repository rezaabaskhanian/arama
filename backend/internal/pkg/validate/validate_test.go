package validate

import "testing"

const op = "test"

func TestPhone(t *testing.T) {
	valid := []string{"09121234567", "09001112233"}
	invalid := []string{"9121234567", "0912123456", "091212345678", "abcd", ""}

	for _, p := range valid {
		if err := Phone(op, p); err != nil {
			t.Errorf("شماره‌ی معتبر %q رد شد: %v", p, err)
		}
	}
	for _, p := range invalid {
		if err := Phone(op, p); err == nil {
			t.Errorf("شماره‌ی نامعتبر %q پذیرفته شد", p)
		}
	}
}

func TestRequired(t *testing.T) {
	if err := Required(op, "نام", "  "); err == nil {
		t.Error("مقدار فقط فاصله باید رد شود")
	}
	if err := Required(op, "نام", "رضا"); err != nil {
		t.Errorf("مقدار معتبر رد شد: %v", err)
	}
}

func TestMaxLen(t *testing.T) {
	if err := MaxLen(op, "متن", "سلام دنیا", 3); err == nil {
		t.Error("متن بلندتر از حد باید رد شود")
	}
	if err := MaxLen(op, "متن", "سلام", 10); err != nil {
		t.Errorf("متن مجاز رد شد: %v", err)
	}
}

func TestInRange(t *testing.T) {
	if err := InRange(op, "mood", 6, 1, 5); err == nil {
		t.Error("عدد خارج بازه باید رد شود")
	}
	if err := InRange(op, "mood", 3, 1, 5); err != nil {
		t.Errorf("عدد داخل بازه رد شد: %v", err)
	}
}
