package commitmentvalueobject

type Category string

const (
	CategoryCommunity Category = "community" // اجتماعی (خانه سالمندان، پارک)
	CategoryNature    Category = "nature"    // طبیعت و حیوانات
	CategoryFamily    Category = "family"    // خانواده
	CategoryKindness  Category = "kindness"  // نوع‌دوستی و خیریه
	CategoryTravel    Category = "travel"    // سفر
)

func (c Category) IsValid() bool {
	switch c {
	case CategoryCommunity, CategoryNature, CategoryFamily, CategoryKindness, CategoryTravel:
		return true
	}
	return false
}
