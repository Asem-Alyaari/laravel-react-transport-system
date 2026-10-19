import React from 'react';
import {
  LayoutDashboard,
  Ticket,
  Calendar,
  Bus,
  UserCheck,
  Search,
  Milestone,
  MapPin,
  LogOut,
  BarChart3,
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Sidebar({ activeView, onSelectView, user, onLogout }) {
  const menuGroups = [
    {
      title: 'الرئيسية والعمليات',
      items: [
        { id: 'home', label: 'لوحة التحكم الرئيسية', icon: LayoutDashboard },
        { id: 'booking', label: 'حجز وتذاكر الرحلات', icon: Ticket },
        { id: 'reports', label: 'التقارير والتحليلات', icon: BarChart3 },
      ],
    },
    {
      title: 'إدارة الخطوط والمحطات',
      items: [
        { id: 'routes', label: 'المسارات وخطوط السير', icon: Milestone },
        { id: 'stations', label: 'محطات الركاب', icon: MapPin },
      ],
    },
    {
      title: 'إدارة الأسطول والتشغيل',
      items: [
        { id: 'trips', label: 'جدولة وإدارة الرحلات', icon: Calendar },
        { id: 'buses', label: 'أسطول الحافلات', icon: Bus },
        { id: 'drivers', label: 'الكباتن والسائقين', icon: UserCheck },
      ],
    },
    {
      title: 'خدمات المسافرين',
      items: [
        { id: 'tracking', label: 'الاستعلام عن حجز (PNR)', icon: Search },
      ],
    },
  ];

  const role = user?.role || 'admin';

  // تصفية القوائم بحسب صلاحيات دور المستخدم
  const isItemAllowed = (itemId) => {
    if (role === 'admin') return true;
    if (role === 'agent') {
      return ['home', 'booking', 'trips', 'buses', 'drivers', 'tracking', 'reports'].includes(itemId);
    }
    if (role === 'passenger') {
      return ['home', 'booking', 'tracking'].includes(itemId);
    }
    return false;
  };

  const filteredMenuGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => isItemAllowed(item.id)),
    }))
    .filter((group) => group.items.length > 0);

  // إعدادات الدور والمظهر
  const getRoleDetails = () => {
    switch (role) {
      case 'admin':
        return {
          label: 'مدير النظام',
          badgeClass: 'text-blue-300 bg-blue-500/20 border-blue-500/30',
          avatarBg: 'from-blue-600 to-indigo-600',
        };
      case 'agent':
        return {
          label: 'موظف حجز',
          badgeClass: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30',
          avatarBg: 'from-emerald-600 to-teal-700',
        };
      case 'passenger':
        return {
          label: 'عميل',
          badgeClass: 'text-amber-300 bg-amber-500/20 border-amber-500/30',
          avatarBg: 'from-amber-600 to-orange-700',
        };
      default:
        return {
          label: 'مستخدم',
          badgeClass: 'text-slate-300 bg-slate-700/40 border-slate-600/40',
          avatarBg: 'from-slate-600 to-slate-800',
        };
    }
  };

  const roleDetails = getRoleDetails();

  return (
    <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-l border-slate-800 shadow-xl z-50 select-none print:hidden">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3.5 border-b border-slate-800/80 bg-slate-950/40">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
          <Bus className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-white font-extrabold text-base tracking-tight">سفريات النخبة</h2>
          <span className="text-[11px] font-semibold text-blue-400 tracking-wider">ELITE TRANSIT ERP</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3.5 space-y-6 overflow-y-auto">
        {filteredMenuGroups.map((group, idx) => (
          <div key={idx}>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectView(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 text-right cursor-pointer',
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    )}
                  >
                    <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer User Profile & Logout */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={cn(
                'w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 select-none',
                roleDetails.avatarBg
              )}
            >
              {user?.name ? user.name.trim().charAt(0).toUpperCase() : 'م'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-200 truncate" title={user?.name || 'مستخدم النظام'}>
                {user?.name || 'مستخدم النظام'}
              </h4>
              <div className="mt-0.5">
                <span
                  className={cn(
                    'inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md border',
                    roleDetails.badgeClass
                  )}
                >
                  {roleDetails.label}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title="تسجيل الخروج"
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 active:bg-red-500/20 transition-all duration-150 cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
