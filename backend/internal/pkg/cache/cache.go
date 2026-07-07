// Package cache یک کش درون‌حافظه‌ای با TTL و امکان همزمانی ارائه می‌دهد.
// اینترفیس Cache طوری طراحی شده که بعداً بتوان پیاده‌سازی Redis را جایگزین کرد
// بدون تغییر در سرویس‌ها (اصل Dependency Inversion).
package cache

import (
	"sync"
	"time"
)

// Cache قرارداد مشترک کش (قابل جایگزینی با Redis)
type Cache interface {
	Get(key string) (interface{}, bool)
	Set(key string, value interface{}, ttl time.Duration)
	Delete(key string)
}

type item struct {
	value     interface{}
	expiresAt time.Time
}

// MemoryCache پیاده‌سازی درون‌حافظه‌ای thread-safe
type MemoryCache struct {
	mu    sync.RWMutex
	items map[string]item
}

func NewMemory() *MemoryCache {
	c := &MemoryCache{items: make(map[string]item)}
	go c.janitor()
	return c
}

func (c *MemoryCache) Get(key string) (interface{}, bool) {
	c.mu.RLock()
	it, ok := c.items[key]
	c.mu.RUnlock()
	if !ok || time.Now().After(it.expiresAt) {
		return nil, false
	}
	return it.value, true
}

func (c *MemoryCache) Set(key string, value interface{}, ttl time.Duration) {
	c.mu.Lock()
	c.items[key] = item{value: value, expiresAt: time.Now().Add(ttl)}
	c.mu.Unlock()
}

func (c *MemoryCache) Delete(key string) {
	c.mu.Lock()
	delete(c.items, key)
	c.mu.Unlock()
}

// janitor به‌صورت دوره‌ای آیتم‌های منقضی را پاک می‌کند
func (c *MemoryCache) janitor() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		now := time.Now()
		c.mu.Lock()
		for k, v := range c.items {
			if now.After(v.expiresAt) {
				delete(c.items, k)
			}
		}
		c.mu.Unlock()
	}
}
