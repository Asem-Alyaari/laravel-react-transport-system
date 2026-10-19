import React from 'react';
import { Calendar, Shield } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

export default function HeaderBar({ activeView, user }) {
  const getBreadcrumbTitle = () => {
    switch (activeView) {
      case 'home':
        return 'لوحة التحكم والعمليات الرئيسية';
      case 'booking':
        return 'بوابة حجز التذاكر واختيار المقاعد';
      case 'trips':
        return 'جدولة وإدارة الرحلات';
      case 'routes':
        return 'المسارات وخطوط السير';
      case 'stations':
        return 'محطات الركاب';
      case 'buses':
        return 'إدارة أسطول الحافلات والمركبات';
      case 'drivers':
        return 'إدارة الكباتن وسائقي الرحلات';
      case 'tracking':
        return 'الاستعلام عن التذاكر برقم المرجع (PNR)';
      case 'reports':
        return 'التقارير والتحليلات المالية والتشغيلية';
      default:
        return 'النظام العام';
    }
  };

  const todayArabic = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const role = user?.role || 'admin';

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return {
          label: 'مدير النظام',
          variant: 'default',
          className: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'agent':
        return {
          label: 'موظف حجز',
          variant: 'success',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'passenger':
        return {
          label: 'عميل',
          variant: 'warning',
          className: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      default:
        return {
          label: 'مستخدم',
          variant: 'secondary',
          className: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs print:hidden">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>سفريات النخبة</span>
        <span className="text-slate-300">/</span>
        <span className="font-bold text-slate-900">{getBreadcrumbTitle()}</span>
      </div>

      {/* Badges / Status */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>{todayArabic}</span>
        </div>

        {/* User name & Dynamic Role Badge */}
        <div className="flex items-center gap-2.5">
          {user?.name && (
            <span className="text-xs font-bold text-slate-700 hidden md:inline-block">
              {user.name}
            </span>
          )}
          <Badge
            variant={roleInfo.variant}
            className={cn('font-bold px-3 py-1 flex items-center gap-1.5', roleInfo.className)}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{roleInfo.label}</span>
          </Badge>
        </div>
      </div>
    </header>
  );
}
