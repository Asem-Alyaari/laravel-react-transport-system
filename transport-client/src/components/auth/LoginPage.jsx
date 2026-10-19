import React, { useState } from 'react';
import { Bus, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, ShieldCheck, UserCheck } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      // التوجيه يتم تلقائياً عبر AuthContext و App.jsx
    } catch (err) {
      setErrorMessage(err.message || 'فشل تسجيل الدخول، يرجى التأكد من البيانات.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password');
    setErrorMessage('');
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 relative overflow-hidden select-none"
    >
      {/* عناصر جمالية متوهجة في الخلفية */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <Card className="border-slate-800/80 bg-slate-900/85 backdrop-blur-xl shadow-2xl shadow-black/60 text-slate-100 rounded-3xl overflow-hidden">
          {/* رأس بطاقة تسجيل الدخول والشعار */}
          <CardHeader className="text-center pt-8 pb-4 px-6 border-b border-slate-800/60 bg-slate-950/40">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 mx-auto mb-3">
              <Bus className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">سفريات النخبة</h1>
            <span className="text-[11px] font-bold text-blue-400 tracking-widest block">
              ELITE TRANSIT ERP
            </span>
            <div className="mt-2.5">
              <span className="inline-block text-xs text-slate-300 bg-slate-800/70 border border-slate-700/60 px-3.5 py-1 rounded-full font-medium shadow-xs">
                منصة النقل الذكية المتكاملة
              </span>
            </div>
          </CardHeader>

          {/* محتوى النموذج */}
          <CardContent className="p-6 sm:p-8 space-y-5">
            {/* رسالة الخطأ عند فشل الدخول */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs font-medium flex items-center gap-2.5 shadow-sm">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="flex-1 leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* حقل البريد الإلكتروني */}
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-bold text-slate-300 block">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@transport.sa"
                    required
                    disabled={isSubmitting}
                    className="pr-10 pl-4 h-11 bg-slate-800/70 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl"
                  />
                </div>
              </div>

              {/* حقل كلمة المرور */}
              <div className="space-y-1.5 text-right">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 block">
                    كلمة المرور
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isSubmitting}
                    className="pr-10 pl-11 h-11 bg-slate-800/70 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* زر تسجيل الدخول */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 mt-2 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق والدخول...</span>
                  </>
                ) : (
                  <>
                    <span>تسجيل الدخول</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* أزرار الحسابات التجريبية السريعة */}
            <div className="pt-2 border-t border-slate-800/60">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2 text-center">
                تعبئة بيانات تجريبية سريعة:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin@transport.sa')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>مدير النظام</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('agent@transport.sa')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>موظف حجز</span>
                </button>
              </div>
            </div>
          </CardContent>

          {/* تذييل البطاقة */}
          <CardFooter className="px-6 py-4 bg-slate-950/60 border-t border-slate-800/60 text-center flex flex-col items-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              حسابات تجريبية: <span className="font-mono text-slate-300">admin@transport.sa</span> /{' '}
              <span className="font-mono text-slate-300">agent@transport.sa</span>
              <br />
              (كلمة المرور: <span className="font-mono text-slate-300">password</span>)
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
