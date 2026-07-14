// lib/api.js

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8086/';

// ایجاد نمونه Axios با تنظیمات پایه
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 ثانیه
});

// Interceptor برای اضافه کردن توکن به همه درخواست‌ها
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor برای مدیریت خطاهای全局
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // توکن منقضی شده یا نامعتبر
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== سرویس ثبت‌نام ==========
export async function registerUser(userData) {
  try {
    const response = await apiClient.post('users/register', {
      nickname: userData.nickname,
      password_hash: userData.password,
      phone: userData.phone,
      role: userData.role || 'user',
    });

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'خطا در ثبت‌نام';
    throw new Error(message);
  }
}

export async function resetPassword(phone, password) {
  try {
    const response = await apiClient.post('/users/reset-pass', {
      phone,
      password,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'خطا در تغییر رمز عبور';
    throw new Error(message);
  }
}

// ========== سرویس ورود ==========
export async function loginUser(phone, password) {
  try {
    const response = await apiClient.post('users/login', {
      phone_number: phone,
      password_hash: password,
    });


    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'خطا در ورود';
    throw new Error(message);
  }
}

// ========== سرویس گرفتن پروفایل کاربر ==========
// export async function getUserProfile(userId) {
//   try {
//     const response = await apiClient.get(`/users/${userId}`);
//     return response.data;
//   } catch (error) {
//     const message = error.response?.data?.message || 'خطا در دریافت پروفایل';
//     throw new Error(message);
//   }
// }

export async function getUserProfile() {
  try {
    const response = await apiClient.get('/users/profile');
    return response.data;
  } catch (error) {
    console.log(error, "ererere")
    // اگر خطای 401 است، پیام خاصی برگردان
    // if (error.response?.status === 401) {
    //   throw new Error('لطفا ابتدا وارد حساب کاربری خود شوید');
    // }
    // const message = error.response?.data?.message || 'خطا در دریافت پروفایل';
    // throw new Error(message);
  }
}

// ========== سرویس به‌روزرسانی پروفایل ==========
export async function updateUserProfile(userId, updateData) {
  try {
    const response = await apiClient.put(`/user/${userId}`, updateData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'خطا در به‌روزرسانی پروفایل';
    throw new Error(message);
  }
}

// ========== سرویس خروج از حساب ==========
export async function logoutUser() {
  try {
    await apiClient.post('/logout');
    return { success: true };
  } catch (error) {
    const message = error.response?.data?.message || 'خطا در خروج';
    throw new Error(message);
  }
}

// ========== شروع تست==========
export async function startAssessment() {
  try {
    const response = await apiClient.post('/assessment/start');

    return response.data;
  } catch (error) {
    console.log(error, "errorrrrssss")
    // const message = error.response?.data?.message || 'خطا در دریافت سوالات';
    // throw new Error(message);
  }
}




// ========== سرویس گرفتن همه سوالات تست ==========
export async function getAssessmentQuestions() {
  try {
    const response = await apiClient.get('/assessment/questions');

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'خطا در دریافت سوالات';
    throw new Error(message);
  }
}

// ========== سرویس ارسال پاسخ‌های تست ==========
export async function submitAssessment(assessmentId, answers) {

  console.log(assessmentId, answers,"assessmentID and Answers")
  try {
    const response = await apiClient.post('/assessment/submit', {

      assessment_id: assessmentId,
      answers: answers,
    });

    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'ی موحودخطا در ثبت پاسخ‌ها';
    throw new Error(message);
  }
}



export async function getAssessmentResult(assessmentId) {
  try {
    const response = await apiClient.get(`/assessment/result/${assessmentId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'ی موحودخطا در ثبت پاسخ‌ها';
    throw new Error(message);
  }
}




// گرفتن لیست تمرین‌ها بر اساس نوع تروما
export async function getExercisesByTraumaType(traumaType) {
  try {
    const response = await apiClient.get(`/exercises/by-trauma/${traumaType}`);


    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'خطا در دریافت تمرین‌ها';
    throw new Error(message);
  }
}


// گرفتن جزئیات یک تمرین
export async function getExerciseById(exerciseId) {
  try {
    const response = await apiClient.get(`/exercises/by-id/${exerciseId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'خطا در دریافت تمرین';
    throw new Error(message);
  }
}



// ثبت انجام تمرین
export async function completeExercise(exerciseId, traumaType) {
  try {
    const response = await apiClient.post(`/exercises/${exerciseId}/complete`, {
      trauma_type: traumaType
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'خطا در ثبت انجام تمرین';
    throw new Error(message);
  }
}

// ========== سرویس گرفتن پیشرفت کاربر ==========
export async function getUserProgress(traumaType) {


  try {
    const response = await apiClient.get('/exercises/user_progress', {
      params: {
        trauma_type: traumaType
      }
    });

    return response.data;
  } catch (error) {

    const message = error.response?.data?.message || 'خطا در دریافت پیشرفت';
    throw new Error(message);
  }
}

// ========== سرویس گرفتن یادداشت‌های دفترچه ==========
export async function getJournalEntries(page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    const response = await apiClient.get('/journal/user', {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'خطا در دریافت یادداشت‌ها';
    throw new Error(message);
  }
}

// ========== سرویس ایجاد یادداشت جدید ==========
export async function createJournalEntry(content, mood) {
  console.log(content, "ccccc")
  try {
    const response = await apiClient.post('/journal/create', {
      content: content,
      mood: mood,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'خطا در ایجاد یادداشت';
    throw new Error(message);
  }
}

// ========== سرویس به‌روزرسانی یادداشت ==========
export async function updateJournalEntry(entryId, content, mood) {
  try {
    const response = await apiClient.put(`/journal/${entryId}`, {
      content: content,
      mood: mood,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'خطا در به‌روزرسانی یادداشت';
    throw new Error(message);
  }
}

// ========== سرویس حذف یادداشت ==========
export async function deleteJournalEntry(entryId) {
  try {
    const response = await apiClient.delete(`/journal/delete/${entryId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'خطا در حذف یادداشت';
    throw new Error(message);
  }
}


// ========== گرفتن یک یادداشت با ID ==========
export async function getJournalEntryById(id) {
  try {
    const response = await apiClient.get(`/journal/${id}`);


    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'خطا در دریافت یادداشت';
    throw new Error(message);
  }
}

// export خود apiClient برای استفاده در جاهای خاص
export default apiClient;



// ========== آمار داشبورد ==========
export async function getDashboardStats(traumaType) {


  try {
    const response = await apiClient.get(`/dashboard/stats/${traumaType}`);



  
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      total_exercises: 0,
      completed_exercises: 0,
      progress_percent: 0,
      journal_entries: 0,
      streak: 0,
      last_assessment_date: null,
      trauma_type: null,
    };
  }
}

// ========== آخرین تست کاربر ==========
export async function getLatestAssessment() {
  try {
    const response = await apiClient.get('/assessment/latest');
    return response.data;
  } catch (error) {
    console.error('Error fetching latest assessment:', error);
    return null;
  }
}


// ========== مود امروز ==========
export async function getTodayMood() {
  try {
    const response = await apiClient.get('/journal/today-mood');
   
    return response.data;
  } catch (error) {
    console.error('Error fetching today mood:', error);
    return null;
  }
}

// ========== ذخیره مود امروز ==========
export async function saveTodayMood(mood) {
  try {
    const response = await apiClient.post('/journal/upsert-mood-add', { mood });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'خطا در ذخیره حس امروز';
    throw new Error(message);
  }
}

// ========== گرفتن تمرین‌های پیشنهادی ==========
export async function getSuggestedExercises(limit = 2) {
  try {
    const traumaType = localStorage.getItem('traumaType') || 'mild';
 

    const response = await getExercisesByTraumaType(traumaType);
    // فقط ۲ تا اول را برمی‌گرداند
    return response.slice(0, limit);
  } catch (error) {
    console.error('Error fetching suggested exercises:', error);
    return [];
  }

  //TODO 
  //   const response = await apiClient.get('/exercises/suggested', {
  //     params: { trauma_type: traumaType, limit }
  //   });
  //   return response.data;
  // } catch (error) {
  //   console.error('Error fetching suggested exercises:', error);
  //   return [];
  // }
}



// ========== Crisis APIs ==========

// گرفتن بحران فعال کاربر
export async function getActiveCrisis() {
  try {
    const response = await apiClient.get('/crisis/active');
    return response.data;
  } catch (error) {
    console.error('Error fetching active crisis:', error);
    return { has_crisis: false, level: 0 };
  }
}

// حل کردن بحران
export async function resolveCrisis(crisisId) {
  try {
    const response = await apiClient.put(`/crisis/${crisisId}/resolve`);

    console.log(response.data, "responseDataaaa")
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || 'خطا در حل بحران';
    throw new Error(message);
  }
}

// بررسی وضعیت بحران (ساده)
export async function checkCrisis() {
  try {
    const response = await apiClient.get('/crisis/check');
    console.log(response.data, "checkcrisis")
    return response.data;
  } catch (error) {
    console.error('Crisis check error:', error);
    return { level: 0, message: '', has_crisis: false };
  }
}



// ========== Admin APIs ==========

// گرفتن آمار پنل ادمین
export async function adminGetStats() {
  const response = await apiClient.get('/admin/stats');
  return response.data;
}

// گرفتن لیست کاربران
export async function adminGetUsers(page = 1, pageSize = 20) {
  const response = await apiClient.get('/admin/users', {
    params: { page, page_size: pageSize }
  });
  return response.data;
}

// تغییر نقش کاربر
export async function adminUpdateUserRole(userId, role) {
  const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
  return response.data;
}


// ========== Admin Exercise APIs ==========
// گرفتن لیست تمرین‌ها (برای ادمین)
export async function adminGetExercises() {
  const response = await apiClient.get('/admin/exercises');
  return response.data;
}

// ایجاد تمرین جدید
export async function adminCreateExercise(data) {
  const response = await apiClient.post('/admin/exercises', data);
  return response.data;
}



export async function adminUpdateExercise(id, data) {
  const response = await apiClient.put(`/admin/exercises/${id}`, data);
  return response.data;
}

export async function adminDeleteExercise(id) {
  const response = await apiClient.delete(`/admin/exercises/${id}`);
  return response.data;
}

// ========== Commitment (تمرین‌های واقعی زندگی) APIs ==========

// فهرست الگوهای تمرین واقعی
export async function getCommitmentTemplates() {
  try {
    const response = await apiClient.get('/commitments/templates');
    const data = response.data || {};
    return {
      templates: data.templates || [],
      unlocked: !!data.unlocked,
      completedExercises: data.completed_exercises || 0,
      requiredExercises: data.required_exercises || 0,
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'خطا در دریافت تمرین‌ها');
  }
}

// فهرست تعهدهای من
export async function getMyCommitments() {
  try {
    const response = await apiClient.get('/commitments/mine');
    return response.data.commitments || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || 'خطا در دریافت تعهدها');
  }
}

// ثبت تعهد جدید (بر اساس یک الگو یا سفارشی)
export async function pledgeCommitment({ templateId, title, category, moodBefore }) {
  try {
    const response = await apiClient.post('/commitments/pledge', {
      template_id: templateId || '',
      title: title || '',
      category: category || '',
      mood_before: moodBefore || 0,
    });
    return response.data.commitment;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'خطا در ثبت تعهد');
  }
}

// انجام تعهد و ثبت بازخورد احساسی
export async function completeCommitment(id, { moodAfter, reflection }) {
  try {
    const response = await apiClient.post(`/commitments/${id}/complete`, {
      mood_after: moodAfter,
      reflection: reflection || '',
    });
    return response.data.commitment;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'خطا در ثبت بازخورد');
  }
}

// لغو تعهد
export async function cancelCommitment(id) {
  try {
    const response = await apiClient.delete(`/commitments/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'خطا در لغو تعهد');
  }
}


// ========== Mood trend / streak ==========
export async function getMoodTrend(days = 14) {
  try {
    const response = await apiClient.get('/journal/mood-trend', { params: { days } });
    return response.data; // { moods:[], days, streak }
  } catch (error) {
    return { moods: [], days, streak: 0 };
  }
}


// ========== Admin Commitment Template APIs ==========
export async function adminGetCommitmentTemplates() {
  const response = await apiClient.get('/admin/commitment-templates');
  return response.data.templates || [];
}

export async function adminCreateCommitmentTemplate(data) {
  const response = await apiClient.post('/admin/commitment-templates', data);
  return response.data;
}

export async function adminUpdateCommitmentTemplate(id, data) {
  const response = await apiClient.put(`/admin/commitment-templates/${id}`, data);
  return response.data;
}

export async function adminDeleteCommitmentTemplate(id) {
  const response = await apiClient.delete(`/admin/commitment-templates/${id}`);
  return response.data;
}


// ========== Psychologist Supervision (نظارت روانشناس) ==========

// وضعیت نظارت + پیام‌های کاربر
export async function getSupervisionStatus() {
  try {
    const response = await apiClient.get('/supervision/status');
    return response.data; // { wants_supervision, messages: [] }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'خطا در دریافت وضعیت نظارت');
  }
}

// روشن/خاموش کردن درخواست نظارت
export async function toggleSupervision(wants) {
  try {
    const response = await apiClient.post('/supervision/toggle', { wants });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'خطا در ذخیره‌ی تنظیمات');
  }
}

// پیام‌های روانشناس برای کاربر
export async function getSupervisionMessages() {
  try {
    const response = await apiClient.get('/supervision/messages');
    return response.data.messages || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || 'خطا در دریافت پیام‌ها');
  }
}

// ارسال پیام از طرف خودِ کاربر برای روانشناس/همراه (چت دوطرفه)
export async function sendSupervisionMessage(body) {
  try {
    const response = await apiClient.post('/supervision/messages', { body });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'خطا در ارسال پیام');
  }
}

// --- سمت روانشناس/ادمین ---

export async function adminGetSupervisedUsers() {
  try {
    const response = await apiClient.get('/admin/supervision/users');
    return response.data.users || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || 'خطا در دریافت کاربران');
  }
}

export async function adminGetUserSupervisionMessages(userId) {
  try {
    const response = await apiClient.get(`/admin/supervision/users/${userId}/messages`);
    return response.data.messages || [];
  } catch (error) {
    throw new Error(error.response?.data?.message || 'خطا در دریافت پیام‌ها');
  }
}

export async function adminSendSupervisionMessage(userId, body) {
  try {
    const response = await apiClient.post(`/admin/supervision/users/${userId}/messages`, { body });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'خطا در ارسال پیام');
  }
}

export async function adminRunSupervisionFallback() {
  try {
    const response = await apiClient.post('/admin/supervision/run-fallback');
    return response.data; // { sent }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'خطا در اجرای پیام‌های خودکار');
  }
}
