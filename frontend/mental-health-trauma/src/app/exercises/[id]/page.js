// app/(dashboard)/exercises/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  Search, Heart, Clock, Play, Sparkles, Plus, Check, 
  ChevronLeft, Wind, BrainCircuit, BookOpen, Filter, 
  TrendingUp, Award, Flame, Dumbbell, Music, Volume2,
  Moon, Sun, Coffee, Smile, Activity
} from 'lucide-react';
import DecorativeBlobs from '@/components/layout/DecorativeBlobs';

// نمونه داده‌های تمرین‌ها (بعداً از API میاد)
const mockExercises = [
  {
    id: '1',
    title: 'تمرین تنفس آگاهانه',
    description: 'تکنیک تنفس مربعی برای کاهش سریع ضربان قلب و بازگشت به لحظه حال در مواقع اضطراب شدید.',
    category: 'تروما',
    difficulty: 'ساده',
    duration: 10,
    liked: true,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop'
  },
  {
    id: '2',
    title: 'مدیتیشن کاهش استرس',
    description: 'تصویرسازی هدایت شده برای رهاسازی تنش‌های عضلانی و ذهنی ناشی از استرس‌های روزمره.',
    category: 'آرامش',
    difficulty: 'متوسط',
    duration: 15,
    liked: false,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop'
  },
  {
    id: '3',
    title: 'یوگا برای آرامش',
    description: 'حرکات کششی ملایم متمرکز بر سیستم عصبی برای کاهش علائم اضطراب در بدن.',
    category: 'اضطراب',
    difficulty: 'ساده',
    duration: 20,
    liked: true,
    image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=300&fit=crop'
  },
  {
    id: '4',
    title: 'تمرین تمرکز ذهن',
    description: 'تکنیک‌های پیشرفته برای مدیریت افکار مزاحم و تقویت توانایی حضور در لحظه حال.',
    category: 'تمرکز',
    difficulty: 'پیشرفته',
    duration: 12,
    liked: false,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop'
  },
  {
    id: '5',
    title: 'آمادگی برای خواب عمیق',
    description: 'روتین صوتی ملایم برای آرام کردن سیستم عصبی پیش از خواب و مقابله با کابوس‌ها.',
    category: 'خواب',
    difficulty: 'ساده',
    duration: 30,
    liked: true,
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop'
  },
];

const categories = ['همه', 'تروما', 'آرامش', 'اضطراب', 'تمرکز', 'خواب'];

export default function ExercisesPage() {
  const [exercises, setExercises] = useState(mockExercises);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('همه');
  const [showBuilder, setShowBuilder] = useState(false);
  const [newExercise, setNewExercise] = useState({ title: '', category: 'آرامش', duration: 10, difficulty: 'ساده', description: '' });

  // فیلتر کردن تمرین‌ها
  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.title.includes(searchTerm) || ex.description.includes(searchTerm);
    const matchesCategory = activeCategory === 'همه' || ex.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLike = (id) => {
    setExercises(prev => prev.map(ex => 
      ex.id === id ? { ...ex, liked: !ex.liked } : ex
    ));
  };

  const handleAddExercise = (e) => {
    e.preventDefault();
    const newEx = {
      id: `custom-${Date.now()}`,
      ...newExercise,
      liked: false,
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop'
    };
    setExercises([newEx, ...exercises]);
    setShowBuilder(false);
    setNewExercise({ title: '', category: 'آرامش', duration: 10, difficulty: 'ساده', description: '' });
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'ساده': return 'bg-emerald-100 text-emerald-700';
      case 'متوسط': return 'bg-amber-100 text-amber-700';
      case 'پیشرفته': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'تروما': return <Wind className="w-4 h-4" />;
      case 'آرامش': return <Coffee className="w-4 h-4" />;
      case 'اضطراب': return <Activity className="w-4 h-4" />;
      case 'تمرکز': return <BrainCircuit className="w-4 h-4" />;
      case 'خواب': return <Moon className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-20 selection:bg-blue-100" dir="rtl">
      <DecorativeBlobs />
      
      <div className="max-w-6xl mx-auto px-4 pt-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 pb-20"
        >
          {/* هدر بخش */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Dumbbell className="w-7 h-7 text-primary" />
            کتابخانه تمرین‌های التیام
          </h1>
          <p className="text-slate-500 text-sm mt-1">تمرین‌های علمی برای مدیریت تروما، اضطراب و بازگشت به آرامش</p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          تمرین شخصی من
        </button>
      </div>

      {/* نوار جستجو و فیلتر */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی تمرین، مدیتیشن یا تکنیک..."
            className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-slate-700 transition-all shadow-sm"
          />
        </div>

        {/* دسته‌بندی‌ها */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* لیست تمرین‌ها - به سبک Stitch */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((ex) => (
          <div
            key={ex.id}
            className="group bg-white/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300"
          >
            <div className="relative h-48 overflow-hidden">
              <img src={ex.image} alt={ex.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              <button
                onClick={() => handleLike(ex.id)}
                className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-white"
              >
                <Heart className={`w-5 h-5 ${ex.liked ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
              </button>
              <div className="absolute bottom-3 right-3 bg-primary/95 text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                {getCategoryIcon(ex.category)}
                <span>{ex.category}</span>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-800 text-lg">{ex.title}</h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${getDifficultyColor(ex.difficulty)}`}>
                  {ex.difficulty}
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{ex.description}</p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-bold">{ex.duration} دقیقه</span>
                </div>
                <Link
                  href={`/exercises/${ex.id}`}
                  className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  شروع تمرین
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* مودال ساخت تمرین شخصی - مثل Stitch */}
      {showBuilder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-white/50 max-w-md w-full p-8 shadow-2xl shadow-blue-900/10"
          >
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-2xl">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              طراحی تمرین اختصاصی
            </h2>
            <form onSubmit={handleAddExercise} className="space-y-4">
              <input
                type="text"
                placeholder="عنوان تمرین"
                value={newExercise.title}
                onChange={(e) => setNewExercise({ ...newExercise, title: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                required
              />
              <textarea
                placeholder="توضیحات تمرین"
                rows={3}
                value={newExercise.description}
                onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={newExercise.category}
                  onChange={(e) => setNewExercise({ ...newExercise, category: e.target.value })}
                  className="px-4 py-3 border border-slate-200 rounded-xl"
                >
                  {categories.filter(c => c !== 'همه').map(cat => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
                <select
                  value={newExercise.difficulty}
                  onChange={(e) => setNewExercise({ ...newExercise, difficulty: e.target.value })}
                  className="px-4 py-3 border border-slate-200 rounded-xl"
                >
                  <option>ساده</option>
                  <option>متوسط</option>
                  <option>پیشرفته</option>
                </select>
              </div>
              <input
                type="number"
                placeholder="مدت زمان (دقیقه)"
                value={newExercise.duration}
                onChange={(e) => setNewExercise({ ...newExercise, duration: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl"
              />
              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-200 text-white py-4 rounded-2xl font-black transition-all hover:scale-[1.02] active:scale-95">ذخیره تمرین</button>
                <button type="button" onClick={() => setShowBuilder(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-black transition-colors">انصراف</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
        </motion.div>
      </div>
    </div>
  );
}