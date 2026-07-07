'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  UserCog,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Shield,
  UserCheck,
  User as UserIcon,
  Loader2,
  RefreshCcw,
  ArrowUpDown
} from 'lucide-react';
import { adminGetUsers, adminUpdateUserRole } from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminGetUsers(1, 50);
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    try {
      await adminUpdateUserRole(userId, newRole);
      await fetchUsers();
    } catch (err) {
      console.error('Error updating role:', err);
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter(user =>
    user.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return {
          text: 'مدیر کل',
          color: 'bg-red-50 text-red-600 border-red-100',
          icon: <Shield className="w-3 h-3" />
        };
      case 'helper':
        return {
          text: 'همیار',
          color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          icon: <UserCheck className="w-3 h-3" />
        };
      default:
        return {
          text: 'کاربر عادی',
          color: 'bg-blue-50 text-blue-600 border-blue-100',
          icon: <UserIcon className="w-3 h-3" />
        };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-bold">در حال بارگذاری کاربران...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <UserCog className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">مدیریت کاربران</h1>
            <p className="text-slate-400 font-bold text-sm">لیست تمام اعضای ثبت‌نام شده در سیستم</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="جستجو کاربر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-11 pl-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all w-full sm:w-64"
            />
          </div>
          <button
            onClick={fetchUsers}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-500 hover:shadow-lg transition-all"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest bg-slate-50/50">
                <th className="px-8 py-5 text-right w-64">اطلاعات کاربر</th>
                <th className="px-8 py-5 text-right">شماره تماس</th>
                <th className="px-8 py-5 text-right">نقش کاربری</th>
                <th className="px-8 py-5 text-right">تاریخ عضویت</th>
                <th className="px-8 py-5 text-center">عملیات مدیریت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {filteredUsers.map((user, idx) => {
                  const badge = getRoleBadge(user.role);
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-white transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-white flex items-center justify-center text-slate-400 font-bold text-lg shadow-inner group-hover:scale-105 transition-transform">
                            {user.nickname?.charAt(0) || <UserIcon className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 leading-none mb-1.5">{user.nickname}</p>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">{user.email || 'بدون ایمیل'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                          <Phone className="w-4 h-4 text-slate-300" />
                          <span dir="ltr">{user.phone}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${badge.color} text-[10px] font-black`}>
                          {badge.icon}
                          {badge.text}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                          <Calendar className="w-4 h-4" />
                          {new Date(user.created_at).toLocaleDateString('fa-IR')}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-3">
                          <div className="relative group/role">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              disabled={updating === user.id}
                              className="appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-black text-slate-600 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-200 transition-all cursor-pointer pr-8"
                            >
                              <option value="user">کاربر عادی</option>
                              <option value="helper">همیار</option>
                              <option value="admin">مدیر کل</option>
                            </select>
                            <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                          </div>

                          {updating === user.id && (
                            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-24 px-6">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">کاربری پیدا نشد</h3>
            <p className="text-slate-400 font-bold">نام کاربری یا شماره موبایل دیگری را امتحان کنید.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}