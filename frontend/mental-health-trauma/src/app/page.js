'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ClipboardList,
  BookOpen,
  User,
  Flame,
  Wind,
  BrainCircuit,
  Quote,
  Calendar,
  Sparkles,
  Heart,
  Loader2
} from 'lucide-react';
import DecorativeBlobs from '@/components/layout/DecorativeBlobs';
import MoodTrendChart from '@/components/journal/MoodTrendChart';
import DailyReminder from '@/components/journal/DailyReminder';
import {
  getDashboardStats,
  getTodayMood,
  saveTodayMood,
  getSuggestedExercises,
  getLatestAssessment
} from '@/lib/api';

const ButterflyIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 10c0-2.5-2-4.5-4.5-4.5S3 7.5 3 10c0 3 4.5 9 9 9s9-6 9-9-2-4.5-4.5-4.5S12 7.5 12 10z" opacity="0.3" />
    <path d="M12 21c-4.5 0-9-6-9-9 0-2.5 2-4.5 4.5-4.5S12 10 12 10s2-2.5 4.5-2.5 4.5 2 4.5 4.5c0 3-4.5 9-9 9z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 10v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// export default function Home() {
//   return (
//     <div className="min-h-screen bg-red-500 flex items-center justify-center">
//       <h1 className="text-6xl font-bold text-white">
//         TAILWIND WORKING
//       </h1>
//     </div>
//   );
// }

export default function DashboardPage() {
  const [userName, setUserName] = useState('پیش‌فرض');
  const [selectedMood, setSelectedMood] = useState(null);
  const [greeting, setGreeting] = useState('صبح بخیر');
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState({
    progress_percent: 0,
    streak: 0,
    completed_exercises: 0,
    total_exercises: 0,
    journal_entries: 0,
    last_assessment_date: null
  });
  const [suggestedExercises, setSuggestedExercises] = useState([]);

  useEffect(() => {
    // 1. Set basic UI state
    setIsLoaded(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('صبح بخیر');
    else if (hour < 18) setGreeting('عصر بخیر');
    else setGreeting('شب بخیر');

    // 2. Fetch data from localStorage
    const savedName = localStorage.getItem('userName');
    if (savedName) setUserName(savedName);

    // 3. Fetch data from API
    async function fetchData() {
      try {
        setLoadingData(true);
        const traumaType = localStorage.getItem('traumaType') || 'mild';

        const [dashboardData, moodData, exercisesData] = await Promise.all([
          getDashboardStats(traumaType),
          getTodayMood(),
          getSuggestedExercises(2)
        ]);

        if (dashboardData) setStats(dashboardData);
        if (moodData && moodData.mood !== undefined) {
          setSelectedMood(moodData.mood);
        }
        if (exercisesData) setSuggestedExercises(exercisesData.slice(0, 2));

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
  }, []);

  const moods = [
    { label: 'خیلی بد', emoji: '😞', color: 'bg-red-50 text-red-500', ring: 'ring-red-200', value: 0 },
    { label: 'بد', emoji: '😕', color: 'bg-orange-50 text-orange-500', ring: 'ring-orange-200', value: 1 },
    { label: 'معمولی', emoji: '😐', color: 'bg-yellow-50 text-yellow-500', ring: 'ring-yellow-200', value: 2 },
    { label: 'خوب', emoji: '🙂', color: 'bg-green-50 text-green-500', ring: 'ring-green-200', value: 3 },
    { label: 'عالی', emoji: '😄', color: 'bg-teal-50 text-teal-500', ring: 'ring-teal-200', value: 4 },
  ];

  const handleMoodSelect = async (moodValue) => {
    try {
      setSelectedMood(moodValue);
      await saveTodayMood(moodValue);
    } catch (err) {
      console.error('Error saving mood:', err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const quickActions = [
    { title: 'تست جدید', icon: <ClipboardList className="w-6 h-6" />, color: 'bg-blue-500', link: '/assessment', bg: 'bg-blue-50' },
    { title: 'تمرین‌ها', icon: <Wind className="w-6 h-6" />, color: 'bg-emerald-500', link: '/exercises', bg: 'bg-emerald-50' },
    { title: 'دفترچه', icon: <BookOpen className="w-6 h-6" />, color: 'bg-purple-500', link: '/journal', bg: 'bg-purple-50' },
    { title: 'پروفایل', icon: <User className="w-6 h-6" />, color: 'bg-orange-500', link: '/profile', bg: 'bg-orange-50' },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return 'تست نداده‌اید';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('fa-IR').format(date);
    } catch {
      return dateStr;
    }
  };

  return (
<>



    <div className="min-h-screen bg-surface text-slate-800 pb-32 selection:bg-brand-100" dir="rtl">
      <DecorativeBlobs />

    

      {/* Header with improved depth */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 px-4 pt-4 pb-2"
      >
        <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-4 shadow-xl shadow-blue-900/5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.8, ease: "anticipate" }}
              className="bg-gradient-to-tr from-indigo-500 to-pink-500 p-2.5 rounded-2xl shadow-lg shadow-indigo-200"
            >
              <ButterflyIcon className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900">{greeting}، {userName} عزیز</h1>
              <p className="text-[10px] font-medium text-slate-400">امروز یک شروع تازه است ✨</p>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-500 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
            </motion.button>
            <Link href="/profile" className="block">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full border-2 border-white overflow-hidden shadow-inner flex items-center justify-center"
              >
                <User className="w-6 h-6 text-blue-600" />
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.header>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        className="relative z-10 max-w-6xl mx-auto px-4 mt-8 space-y-8"
      >
        {/* Daily check-in reminder */}
        <motion.div variants={itemVariants}>
          <DailyReminder loggedToday={selectedMood !== null} />
        </motion.div>

        {/* Mood Tracker - More Glassy & Interactive */}
        <motion.section variants={itemVariants} className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/80 shadow-2xl shadow-slate-200 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
              حس امروز تو چطوره؟
            </h2>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Heart className="w-4 h-4 fill-current" />
            </div>
          </div>

          <div className="flex justify-between gap-3">
            {moods.map((mood, idx) => (
              <motion.button
                key={idx}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.9 }}
                animate={selectedMood === mood.value ? { scale: 1.15 } : { scale: 1 }}
                onClick={() => handleMoodSelect(mood.value)}
                className={`flex-1 flex flex-col items-center gap-3 py-4 rounded-3xl transition-all duration-300 ${selectedMood === mood.value
                  ? `${mood.color} ring-4 ring-offset-4 ring-white ${mood.ring} shadow-xl shadow-slate-200`
                  : 'bg-slate-50/50 hover:bg-white hover:shadow-lg'
                  }`}
              >
                <span className="text-3xl filter drop-shadow-sm">{mood.emoji}</span>
                <span className={`text-[10px] font-bold tracking-tight ${selectedMood === mood.value ? 'opacity-100' : 'opacity-40'}`}>
                  {mood.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Mood trend chart */}
        <motion.div variants={itemVariants}>
          <MoodTrendChart days={14} />
        </motion.div>

        {/* Progress Card - Lush Gradient & Animation */}
        <motion.section
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          className="group relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-indigo-900 p-7 rounded-[2rem] shadow-[0_20px_50px_-15px_rgba(59,130,246,0.35)] text-white"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">مسیر بهبودی</p>
                <h3 className="text-4xl font-black">{stats.progress_percent}% <span className="text-lg font-medium text-blue-200">کامل شده</span></h3>
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-black border border-white/20 whitespace-nowrap"
              >
                {stats.streak} روز پیاپی 🔥
              </motion.div>
            </div>

            <div className="relative h-4 bg-black/20 rounded-full overflow-hidden border border-white/10 p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.progress_percent}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className="h-full bg-gradient-to-r from-teal-300 to-emerald-400 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.5)] relative overflow-hidden"
              >
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full"
                />
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              {[
                { label: 'تمرین‌ها', value: `${stats.completed_exercises} از ${stats.total_exercises}`, icon: <Wind className="w-4 h-4" /> },
                { label: 'یادداشت‌ها', value: `${stats.journal_entries} مورد`, icon: <BookOpen className="w-4 h-4" /> }
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="p-2 bg-blue-500/20 rounded-xl text-blue-200">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-blue-200">{stat.label}</p>
                    <p className="text-sm font-black">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-between items-center text-[11px] font-bold text-blue-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>آخرین پایش وضعیت:</span>
              </div>
              <span className="bg-white/10 px-2.5 py-1 rounded-lg">
                {formatDate(stats.last_assessment_date)}
              </span>
            </div>
          </div>
        </motion.section>

        {/* Quick Actions Grid */}
        <motion.section variants={itemVariants} className="grid grid-cols-2 gap-5">
          {quickActions.map((action, idx) => (
            <Link href={action.link} key={idx} className="block">
              <motion.div
                whileHover={{ y: -8, shadow: "0 25px 50px -12px rgba(0,0,0,0.08)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 flex flex-col items-center gap-4 text-center group cursor-pointer transition-all duration-300"
              >
                <div className={`${action.bg} ${action.color.replace('bg-', 'text-')} p-4 rounded-3xl group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                  {action.icon}
                </div>
                <span className="text-sm font-black text-slate-800 tracking-tight">{action.title}</span>
              </motion.div>
            </Link>
          ))}
        </motion.section>

        {/* Real-world commitments CTA — ویژگی شاخص */}
        <motion.section variants={itemVariants}>
          <Link href="/commitments" className="block">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 p-6 rounded-[2rem] shadow-[0_20px_50px_-15px_rgba(16,185,129,0.4)] text-white flex items-center justify-between gap-4"
            >
              <div className="relative z-10">
                <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest mb-1">تمرین‌های واقعی زندگی</p>
                <h3 className="text-lg font-black leading-snug">قدمی در دنیای واقعی بردار 🌱</h3>
                <p className="text-xs font-medium text-emerald-50/90 mt-1">به سالمندان سر بزن، سفر کن، مهربانی کن...</p>
              </div>
              <div className="relative z-10 bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0">
                <Sparkles className="w-7 h-7" />
              </div>
            </motion.div>
          </Link>
        </motion.section>

        {/* Suggested Exercises - More Modern Visuals */}
        <motion.section variants={itemVariants} className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">پیشنهادهای مخصوص تو</h2>
              <p className="text-xs font-bold text-slate-400 mt-1">منتخب بر اساس وضعیت روحی شما</p>
            </div>
            <Link href="/exercises" className="text-blue-600 text-xs font-black hover:underline px-4 py-2 bg-blue-50 rounded-full transition-colors">
              مشاهده همه
            </Link>
          </div>

          <div className="grid gap-5">
            {loadingData ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : suggestedExercises.length > 0 ? (
              suggestedExercises.map((ex, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: -10 }}
                  className="group relative bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 flex justify-between items-center transition-all overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b opacity-20 from-blue-500 to-indigo-600" />
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="bg-blue-50 p-4 rounded-[1.5rem] text-blue-500 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                      <Wind className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900">{ex.title}</h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => <div key={s} className={`w-1.5 h-1.5 rounded-full ${s <= (ex.difficulty || 3) ? 'bg-amber-400' : 'bg-slate-200'}`} />)}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ex.duration_minutes} دقیقه</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/exercises/${ex.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-7 py-3 rounded-2xl text-xs font-black shadow-lg shadow-blue-200 group-hover:shadow-blue-300 transition-all"
                    >
                      شروع
                    </motion.button>
                  </Link>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-slate-400 text-sm py-8 bg-white/40 rounded-[2rem] border border-dashed border-slate-200">
                تمرینی برای نمایش وجود ندارد
              </p>
            )}
          </div>
        </motion.section>

        {/* Motivation Quote - Elegant Amber Centerpiece */}
        <motion.section
          variants={itemVariants}
          className="relative group p-8 rounded-[2.5rem] border-2 border-amber-50 bg-amber-50/30 overflow-hidden text-center"
        >
          <Quote className="absolute -top-4 -right-4 w-20 h-20 text-amber-200/20 rotate-12" />
          <Quote className="absolute -bottom-4 -left-4 w-20 h-20 text-amber-200/20 -rotate-12" />

          <div className="relative z-10 space-y-4">
            <div className="flex justify-center mb-2">
              <div className="h-1 w-12 bg-gradient-to-r from-transparent via-amber-300 to-transparent rounded-full" />
            </div>
            <p className="text-base font-bold italic text-amber-900/80 leading-relaxed max-w-sm mx-auto">
              "شفا به معنای این نیست که آسیب هرگز رخ نداده است. شفا به این معناست که آن آسیب دیگر کنترل زندگی تو را در دست ندارد."
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/60">— خرد درون تو</p>
          </div>
        </motion.section>
      </motion.main>

      {/* Modern Footer Branding */}
      <footer className="mt-16 pb-12 flex flex-col items-center gap-4 opacity-40">
        <div className="flex items-center gap-3 grayscale group hover:grayscale-0 transition-all duration-700">
          <div className="w-8 h-8 bg-slate-200 rounded-xl flex items-center justify-center p-1.5 group-hover:bg-indigo-100 transition-colors">
            <ButterflyIcon className="w-full h-full text-slate-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[.25em] text-slate-500">Mindful Recovery</span>
        </div>
      </footer>
    </div>
</>
    
  
  );
}