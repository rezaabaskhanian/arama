package commitmentvalueobject

type Status string

const (
	StatusPledged   Status = "pledged"   // تعهد داده شده، هنوز انجام نشده
	StatusCompleted Status = "completed" // انجام شد و بازخورد ثبت شد
	StatusCancelled Status = "cancelled" // لغو شد
)
