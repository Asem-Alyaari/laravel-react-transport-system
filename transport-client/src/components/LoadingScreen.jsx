import React from 'react';
import { Bus, Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 select-none"
    >
      <div className="flex flex-col items-center space-y-4 text-center max-w-sm">
        {/* Animated Brand Bus Icon */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 animate-pulse">
            <Bus className="w-8 h-8" />
          </div>
          <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-md">
            <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          </div>
        </div>

        {/* Brand & Loading Info */}
        <div className="space-y-1">
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">سفريات النخبة</h2>
          <span className="text-[11px] font-semibold text-blue-600 tracking-wider block">
            ELITE TRANSIT ERP
          </span>
          <p className="text-xs font-medium text-slate-500 pt-1">
            جاري تحميل النظام والتحقق من الصلاحيات...
          </p>
        </div>
      </div>
    </div>
  );
}
