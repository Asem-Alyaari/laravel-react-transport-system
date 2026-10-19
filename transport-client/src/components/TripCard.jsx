import React from 'react';
import { Wifi, Zap, Coffee, Tv, Shield, Users, ArrowLeft } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export default function TripCard({ trip, onSelectSeats }) {
  const formatTime = (dtString) => {
    try {
      const date = new Date(dtString);
      return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dtString;
    }
  };

  const hours = Math.floor(trip.duration_minutes / 60);
  const mins = trip.duration_minutes % 60;
  const durationText = `${hours} س ${mins > 0 ? `${mins} د` : ''}`;

  return (
    <Card className="p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Departure & Arrival Flow */}
        <div className="md:col-span-5 flex items-center justify-between gap-4">
          <div className="text-right">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatTime(trip.departure_datetime)}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">محطة الانطلاق</div>
          </div>

          {/* Flow Line */}
          <div className="flex-1 flex flex-col items-center gap-1.5 px-2">
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
              {durationText}
            </span>
            <div className="w-full h-0.5 bg-slate-200 relative">
              <div className="absolute right-0 -top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              <div className="absolute left-0 -top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium">مباشر ومحطات بينية</span>
          </div>

          <div className="text-left">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatTime(trip.arrival_datetime)}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">محطة الوصول</div>
          </div>
        </div>

        {/* Bus Info & Amenities */}
        <div className="md:col-span-4 space-y-2 md:border-r md:border-slate-100 md:pr-6">
          <div className="flex items-center gap-2">
            <Badge variant={trip.bus?.bus_type === 'vip' ? 'vip' : 'secondary'}>
              <Shield className="w-3 h-3" />
              <span>{trip.bus?.bus_type === 'vip' ? 'VIP ملكية فاخرة' : 'حافلة قياسية'}</span>
            </Badge>
          </div>

          <div className="text-xs font-bold text-slate-700">
            {trip.bus?.model || trip.bus?.bus_number}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">
              <Wifi className="w-3 h-3" /> واي فاي
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">
              <Zap className="w-3 h-3" /> شاحن
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">
              <Coffee className="w-3 h-3" /> ضيافة
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">
              <Tv className="w-3 h-3" /> شاشات
            </span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="md:col-span-3 flex flex-col items-end justify-center space-y-2 md:border-r md:border-slate-100 md:pr-6">
          <div className="text-right w-full">
            <div className="text-2xl font-black text-emerald-600">
              {trip.fare} <span className="text-xs font-bold text-slate-500">ر.س</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-0.5">
              <Users className="w-3.5 h-3.5" />
              <span>متبقي {trip.bus?.available_seats} مقعد شاغر</span>
            </div>
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 font-bold shadow-sm shadow-blue-600/20"
            onClick={() => onSelectSeats(trip)}
          >
            <span>اختيار المقاعد</span>
            <ArrowLeft className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
