package cache

import (
	"testing"
	"time"
)

func TestMemoryCache_SetGet(t *testing.T) {
	c := NewMemory()

	c.Set("k1", "hello", time.Minute)
	v, ok := c.Get("k1")
	if !ok || v != "hello" {
		t.Fatalf("انتظار مقدار hello داشتیم، دریافت: %v ok=%v", v, ok)
	}
}

func TestMemoryCache_Expiry(t *testing.T) {
	c := NewMemory()

	c.Set("k2", 42, 20*time.Millisecond)
	time.Sleep(40 * time.Millisecond)
	if _, ok := c.Get("k2"); ok {
		t.Fatal("کلید منقضی‌شده نباید برگردد")
	}
}

func TestMemoryCache_Delete(t *testing.T) {
	c := NewMemory()

	c.Set("k3", true, time.Minute)
	c.Delete("k3")
	if _, ok := c.Get("k3"); ok {
		t.Fatal("کلید حذف‌شده نباید برگردد")
	}
}

func TestMemoryCache_Miss(t *testing.T) {
	c := NewMemory()
	if _, ok := c.Get("missing"); ok {
		t.Fatal("کلید ناموجود نباید ok=true بدهد")
	}
}
