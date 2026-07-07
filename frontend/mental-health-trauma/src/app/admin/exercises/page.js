'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dumbbell,
  Plus,
  Search,
  Edit3,
  Trash2,
  Type,
  Clock,
  ArrowUp01,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';
import { adminGetExercises, adminCreateExercise, adminUpdateExercise, adminDeleteExercise } from '@/lib/api';

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    trauma_type: 'mild',
    duration: 5,
    order: 1,
  });

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const data = await adminGetExercises();
      setExercises(data);
    } catch (err) {
      console.error('Error fetching exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editing) {
        await adminUpdateExercise(editing.id, formData);
      } else {
        await adminCreateExercise(formData);
      }
      setShowModal(false);
      setEditing(null);
      setFormData({ title: '', description: '', trauma_type: 'mild', duration: 5, order: 1 });
      fetchExercises();
    } catch (err) {
      console.error('Error saving exercise:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (exercise) => {
    setEditing(exercise);
    setFormData({
      title: exercise.title,
      description: exercise.description,
      trauma_type: exercise.trauma_type,
      duration: exercise.duration,
      order: exercise.order,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا مطمئنی می‌خواهی این تمرین را حذف کنی؟')) return;
    try {
      await adminDeleteExercise(id);
      fetchExercises();
    } catch (err) {
      console.error('Error deleting exercise:', err);
    }
  };

  const traumaTypes = [
    { value: 'mild', label: 'ترومای خفیف', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { value: 'moderate', label: 'ترومای متوسط', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { value: 'severe', label: 'ترومای شدید', color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { value: 'complex', label: 'ترومای پیچیده', color: 'bg-rose-50 text-rose-600 border-rose-100' },
  ];

  const filteredExercises = exercises.filter(ex =>
    ex.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.trauma_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-bold">در حال بارگذاری تمرین‌ها...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
            <Dumbbell className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">مدیریت تمرین‌ها</h1>
            <p className="text-slate-400 font-bold text-sm">محتوای تمرینات آرامش‌بخش سیستم</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="جستجو تمرین..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-11 pl-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all w-full sm:w-64"
            />
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setFormData({ title: '', description: '', trauma_type: 'mild', duration: 5, order: 1 });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-100 hover:shadow-emerald-200"
          >
            <Plus className="w-5 h-5" />
            تمرین جدید
          </button>
        </div>
      </div>

      {/* Exercises Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest bg-slate-50/50">
                <th className="px-8 py-5 text-right">عنوان تمرین</th>
                <th className="px-8 py-5 text-right">درجه سختی (تروما)</th>
                <th className="px-8 py-5 text-right">مدت زمان</th>
                <th className="px-8 py-5 text-right">اولویت نمایش</th>
                <th className="px-8 py-5 text-right">وضعیت اکتیو</th>
                <th className="px-8 py-5 text-center w-32">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {filteredExercises.map((exercise, idx) => {
                  const typeInfo = traumaTypes.find(t => t.value === exercise.trauma_type) || { label: exercise.trauma_type, color: 'bg-slate-50 text-slate-600' };
                  return (
                    <motion.tr
                      key={exercise.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-white transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Type className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 leading-none mb-1.5">{exercise.title}</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate max-w-[200px]">{exercise.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${typeInfo.color} text-[10px] font-black`}>
                          <AlertCircle className="w-3 h-3" />
                          {typeInfo.label}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                          <Clock className="w-4 h-4 text-slate-300" />
                          <span>{exercise.duration} دقیقه</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                          <ArrowUp01 className="w-4 h-4" />
                          <span>{exercise.order}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {exercise.is_active !== false ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black">
                            <CheckCircle2 className="w-4 h-4" />
                            فعال
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black">
                            <XCircle className="w-4 h-4" />
                            غیرفعال
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(exercise)}
                            className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(exercise.id)}
                            className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-24 px-6">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Dumbbell className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">تمرینی پیدا نشد</h3>
            <p className="text-slate-400 font-bold">نام تمرین دیگری را جستجو کنید.</p>
          </div>
        )}
      </motion.div>

      {/* Modal - Modernized */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-xl bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[3rem] shadow-2xl z-[70] flex flex-col overflow-hidden max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      {editing ? 'ویرایش تمرین موجود' : 'افزودن تمرین جدید'}
                    </h2>
                    <p className="text-xs font-bold text-slate-400">اطلاعات تمرین را با دقت وارد کنید</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form Body */}
              <div className="p-8 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">عنوان تمرین</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                        placeholder="مثلاً: تنفس عمیق ۳ دقیقه‌ای"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">توضیحات تمرین</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all min-h-[120px] resize-none placeholder:text-slate-300"
                        placeholder="مراحل انجام تمرین را در اینجا بنویسید..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">نوع تروما (هدف)</label>
                      <div className="relative">
                        <select
                          value={formData.trauma_type}
                          onChange={(e) => setFormData({ ...formData, trauma_type: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                          {traumaTypes.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                        <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">مدت زمان (دقیقه)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all pr-12"
                          min="1"
                        />
                        <Clock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">اولویت نمایش</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.order}
                          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 outline-none transition-all pr-12"
                          min="1"
                        />
                        <ArrowUp01 className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-6 py-4 rounded-2xl font-black text-sm text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : editing ? 'ذخیره تغییرات' : 'انتشار تمرین'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}