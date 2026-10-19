import axios from 'axios';

/**
 * إعداد اتصال Axios المخصص للربط مع واجهات برمجة التطبيقات (Laravel API)
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// معترض الطلبات (Request Interceptor): إضافة رمز التوثيق Bearer Token تلقائياً إذا كان مسجلاً
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// معترض الاستجابات (Response Interceptor): التعامل مع أخطاء الاستجابة (مثل 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // إزالة بيانات الجلسة عند انتهاء الصلاحية
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export default api;
