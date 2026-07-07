'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Pencil, Trash2, Target, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge, Spinner, EmptyState } from '@/components/ui/feedback';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  adminGetCommitmentTemplates, adminCreateCommitmentTemplate,
  adminUpdateCommitmentTemplate, adminDeleteCommitmentTemplate,
} from '@/lib/api';

const CATEGORIES = [
  { value: 'community', label: 'اجتماعی' },
  { value: 'nature', label: 'طبیعت' },
  { value: 'family', label: 'خانواده' },
  { value: 'kindness', label: 'نوع‌دوستی' },
  { value: 'travel', label: 'سفر' },
];
const CAT_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

const emptyForm = { title: '', description: '', category: 'community', icon: 'sparkles', duration_hint: '', order_index: 0, is_active: true };

export default function AdminCommitmentsPage() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setItems(await adminGetCommitmentTemplates());
    } catch (err) {
      toast(err.message || 'خطا در دریافت', 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (t) => {
    setEditing(t);
    setForm({
      title: t.title, description: t.description, category: t.category,
      icon: t.icon, duration_hint: t.duration_hint, order_index: t.order_index, is_active: t.is_active,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast('عنوان و توضیحات الزامی است', 'error'); return;
    }
    try {
      setSaving(true);
      if (editing) {
        await adminUpdateCommitmentTemplate(editing.id, form);
        toast('تمرین به‌روزرسانی شد', 'success');
      } else {
        await adminCreateCommitmentTemplate(form);
        toast('تمرین جدید ساخته شد', 'success');
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      toast(err.message || 'خطا در ذخیره', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminDeleteCommitmentTemplate(confirmDel.id);
      toast('تمرین حذف شد', 'info');
      setConfirmDel(null);
      await load();
    } catch (err) {
      toast(err.message || 'خطا در حذف', 'error');
    }
  };

  return (
    <div dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">تمرین‌های واقعی زندگی</h1>
          <p className="text-sm font-bold text-slate-400 mt-1">مدیریت الگوهای تعهد کاربران</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> تمرین جدید</Button>
      </div>

      {loading ? (
        <Spinner label="در حال بارگذاری..." />
      ) : items.length === 0 ? (
        <EmptyState icon={Target} title="هیچ تمرینی ثبت نشده" description="اولین تمرین واقعی زندگی را بساز." />
      ) : (
        <div className="grid gap-4">
          {items.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start justify-between gap-4 ${!t.is_active ? 'opacity-60' : ''}`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-black text-slate-900">{t.title}</h3>
                  <Badge tone="brand">{CAT_LABEL[t.category] || t.category}</Badge>
                  {t.is_active
                    ? <Badge tone="calm"><Eye className="w-3 h-3" /> فعال</Badge>
                    : <Badge tone="slate"><EyeOff className="w-3 h-3" /> غیرفعال</Badge>}
                </div>
                <p className="text-sm text-slate-500 font-medium line-clamp-2">{t.description}</p>
                {t.duration_hint && <p className="text-[11px] font-bold text-slate-400 mt-1">⏱ {t.duration_hint}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(t)} className="p-2.5 rounded-xl text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors" aria-label="ویرایش">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => setConfirmDel(t)} className="p-2.5 rounded-xl text-slate-400 hover:bg-danger-50 hover:text-danger-500 transition-colors" aria-label="حذف">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal ساخت/ویرایش */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'ویرایش تمرین' : 'تمرین جدید'}
        maxWidth="max-w-lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>انصراف</Button>
            <Button size="sm" loading={saving} onClick={handleSave}>ذخیره</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>عنوان</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثلاً: سر زدن به خانه‌ی سالمندان" />
          </div>
          <div>
            <Label>توضیحات</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="کاربر باید چه کاری انجام دهد؟" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>دسته‌بندی</Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-4 bg-slate-50/60 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              >
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <Label>مدت‌زمان (متن)</Label>
              <Input value={form.duration_hint} onChange={(e) => setForm({ ...form, duration_hint: e.target.value })} placeholder="حدود ۱ ساعت" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <Label>ترتیب نمایش</Label>
              <Input type="number" value={form.order_index} onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })} />
            </div>
            <label className="flex items-center gap-2 py-4 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-5 h-5 accent-brand-600" />
              <span className="text-sm font-black text-slate-700">فعال باشد</span>
            </label>
          </div>
        </div>
      </Modal>

      {/* تأیید حذف */}
      <Modal
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title="حذف تمرین"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDel(null)}>انصراف</Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>حذف کن</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 font-medium">
          آیا از حذف «{confirmDel?.title}» مطمئن هستی؟ این کار قابل بازگشت نیست.
        </p>
      </Modal>
    </div>
  );
}
