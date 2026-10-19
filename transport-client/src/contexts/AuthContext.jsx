import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // التحقق من حالة التوثيق عند تحميل التطبيق
  const checkAuth = useCallback(async () => {
    const savedToken = localStorage.getItem('token');
    const savedUserJson = localStorage.getItem('user');

    if (!savedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    let parsedUser = null;
    try {
      if (savedUserJson) {
        parsedUser = JSON.parse(savedUserJson);
      }
    } catch (e) {
      console.error('خطأ في قراءة بيانات المستخدم المخزنة محلياً:', e);
    }

    try {
      const res = await api.get('/auth/me');
      const userData = res.data?.user || res.data?.data?.user || res.data?.data || res.data;
      if (userData) {
        setUser(userData);
        setToken(savedToken);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error('بيانات المستخدم غير صالحة');
      }
    } catch (err) {
      // إذا كانت الاستجابة 401 غير مصرح، يتم مسح الجلسة
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } else if ((err.response?.status === 404 || !err.response) && parsedUser) {
        // في بيئة التطوير إذا كان الخادم غير متصل أو نقطة النهاية لم تنشأ بعد، نحتفظ بالحساب التجريبي المخزن
        setUser(parsedUser);
        setToken(savedToken);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // الاستماع لحدث تسجيل الخروج التلقائي الصادر من معترض Axios
    const handleAuthLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [checkAuth]);

  // دالة تسجيل الدخول
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      const receivedToken = data.token || data.access_token || data.data?.token || data.data?.access_token;
      const receivedUser = data.user || data.data?.user || data.data;

      if (!receivedToken || !receivedUser) {
        throw new Error('استجابة غير صالحة من خادم التوثيق');
      }

      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, user: receivedUser };
    } catch (err) {
      // دعم الحسابات التجريبية في حال كان الخادم غير متاح أو النقطة 404
      if (err.response?.status === 404 || !err.response) {
        if (email === 'admin@transport.sa' && password === 'password') {
          const mockUser = {
            id: 1,
            name: 'عبدالله السعدون',
            email: 'admin@transport.sa',
            role: 'admin',
          };
          const mockToken = 'mock-bearer-token-admin-998877';
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify(mockUser));
          setToken(mockToken);
          setUser(mockUser);
          return { success: true, user: mockUser };
        }
        if (email === 'agent@transport.sa' && password === 'password') {
          const mockUser = {
            id: 2,
            name: 'خالد المنصور',
            email: 'agent@transport.sa',
            role: 'agent',
          };
          const mockToken = 'mock-bearer-token-agent-665544';
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify(mockUser));
          setToken(mockToken);
          setUser(mockUser);
          return { success: true, user: mockUser };
        }
        if (email === 'passenger@transport.sa' && password === 'password') {
          const mockUser = {
            id: 3,
            name: 'سارة العتيبي',
            email: 'passenger@transport.sa',
            role: 'passenger',
          };
          const mockToken = 'mock-bearer-token-passenger-112233';
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify(mockUser));
          setToken(mockToken);
          setUser(mockUser);
          return { success: true, user: mockUser };
        }
      }

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'البريد الإلكتروني أو كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.';
      throw new Error(errorMessage);
    }
  };

  // دالة تسجيل حساب جديد
  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const data = res.data;
      const receivedToken = data.token || data.access_token || data.data?.token || data.data?.access_token;
      const receivedUser = data.user || data.data?.user || data.data;

      if (receivedToken && receivedUser) {
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(receivedUser));
        setToken(receivedToken);
        setUser(receivedUser);
      }

      return { success: true, user: receivedUser, token: receivedToken };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'فشل إنشاء الحساب الجديد، يرجى مراجعة البيانات.';
      throw new Error(errorMessage);
    }
  };

  // دالة تسجيل الخروج
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('تعذر إرسال طلب تسجيل الخروج للخادم:', err.message);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
