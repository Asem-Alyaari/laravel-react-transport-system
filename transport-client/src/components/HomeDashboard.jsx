import React, { useState, useEffect } from 'react';
import {
  Bus,
  UserCheck,
  MapPin,
  Ticket,
  ArrowLeft,
  Clock,
  Sparkles,
  PlusCircle,
  TrendingUp,
  Milestone,
  BarChart3,
} from 'lucide-react';
import api from '../api/axios';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export default function HomeDashboard({ onNavigate, onSelectTripForBooking }) {
  const [stats, setStats] = useState({
    busesCount: 0,
    driversCount: 0,
    stationsCount: 0,
    tripsCount: 0,
  });
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/buses').catch(() => ({ data: { data: [] } })),
      api.get('/drivers').catch(() => ({ data: { data: [] } })),
      api.get('/stations').catch(() => ({ data: { data: [] } })),
      api.get('/trips/search', { params: { origin_id: 1, destination_id: 4 } }).catch(() => ({ data: { data: [] } })),
    ])
      .then(([busesRes, driversRes, stationsRes, tripsRes]) => {
        const buses = busesRes.data?.data || [];
        const drivers = driversRes.data?.data || [];
        const stations = stationsRes.data?.data || [];
        const trips = tripsRes.data?.data || [];

        setStats({
          busesCount: buses.length,
          driversCount: drivers.length,
          stationsCount: stations.length,
          tripsCount: trips.length > 0 ? trips.length : 1,
        });

        setUpcomingTrips(trips);
      })
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    {
      title: 'حافلات الأسطول',
      count: stats.busesCount,
      icon: Bus,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      action: () => onNavigate('buses'),
    },
    {
      title: 'الكباتن والسائقين',
      count: stats.driversCount,
      icon: UserCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      action: () => onNavigate('drivers'),
    },
    {
      title: 'المحطات الرئيسية',
      count: stats.stationsCount,
      icon: MapPin,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      action: () => onNavigate('stations'),
    },
    {
      title: 'الرحلات اليومية',
      count: stats.tripsCount,
      icon: TrendingUp,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      action: () => onNavigate('booking'),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Banner with Shadcn styling */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 p-8 md:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-semibold text-blue-300 backdrop-blur-md border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>نظام النقل الذكي المتكامل - الجيل الجديد</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            مرحباً بك في منصة سفريات النخبة
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            النظام السحابي المتكامل لإدارة أسطول الحافلات، جدولة الرحلات بين المدن، خريطة المقاعد التفاعلية، وإصدار التذاكر الرقمية الموثقة بـ QR Code.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              size="lg"
              className="bg-white text-blue-900 hover:bg-slate-100 font-bold shadow-lg"
              onClick={() => onNavigate('booking')}
            >
              <Ticket className="w-5 h-5 ml-1" />
              <span>حجز تذكرة رحلة الآن</span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
              onClick={() => onNavigate('buses')}
            >
              <Bus className="w-5 h-5 ml-1" />
              <span>استعراض أسطول الحافلات</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={idx}
              onClick={kpi.action}
              className="p-5 flex items-center gap-4 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 ${kpi.color}`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {loading ? '...' : kpi.count}
                </h3>
                <span className="text-xs font-semibold text-slate-500">{kpi.title}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Lower Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Trips Panel */}
        <Card className="lg:col-span-2 overflow-hidden shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between py-4 px-6 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <CardTitle>أحدث الرحلات المجدولة النشطة</CardTitle>
            </div>
            <Button
              variant="link"
              className="text-xs font-bold text-blue-600"
              onClick={() => onNavigate('booking')}
            >
              <span>عرض جميع الرحلات</span>
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            </Button>
          </CardHeader>

          <CardContent className="p-6">
            {upcomingTrips.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <Bus className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm">لا توجد رحلات مسجلة حالياً، توجه إلى نافذة الحجز لتحديد خط سير.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTrips.slice(0, 3).map((trip) => (
                  <div
                    key={trip.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors gap-3"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-base">{trip.route_name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        الرمز: <strong className="text-slate-700">{trip.trip_code}</strong> | الحافلة: {trip.bus?.model} ({trip.bus?.bus_type === 'vip' ? 'VIP فاخر' : 'قياسي'})
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-left">
                        <div className="text-lg font-black text-emerald-600">{trip.fare} ر.س</div>
                        <div className="text-[11px] font-semibold text-slate-500">متبقي {trip.bus?.available_seats} مقعد</div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => {
                          onNavigate('booking');
                          if (onSelectTripForBooking) onSelectTripForBooking(trip);
                        }}
                      >
                        <span>حجز</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Shortcuts */}
        <Card className="shadow-xs">
          <CardHeader className="py-4 px-6 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <CardTitle>إجراءات سريعة</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-2.5">
            <button
              type="button"
              onClick={() => onNavigate('booking')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-blue-50/60 hover:border-blue-200 transition-all text-slate-800 text-sm font-semibold cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Ticket className="w-4 h-4" />
                </div>
                <span>قص وحجز تذكرة رحلة جديدة</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('reports')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-emerald-50/60 hover:border-emerald-200 transition-all text-slate-800 text-sm font-semibold cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span>التقارير والتحليلات المالية والتشغيلية</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('routes')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-indigo-50/60 hover:border-indigo-200 transition-all text-slate-800 text-sm font-semibold cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Milestone className="w-4 h-4" />
                </div>
                <span>إضافة مسار أو خط سير جديد</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('buses')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-emerald-50/60 hover:border-emerald-200 transition-all text-slate-800 text-sm font-semibold cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <span>إضافة حافلة جديدة للأسطول</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('drivers')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-cyan-50/60 hover:border-cyan-200 transition-all text-slate-800 text-sm font-semibold cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span>تسجيل وتعيين كابتن جديد</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('tracking')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-purple-50/60 hover:border-purple-200 transition-all text-slate-800 text-sm font-semibold cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Ticket className="w-4 h-4" />
                </div>
                <span>استعلام وتتبع تذكرة (PNR)</span>
              </div>
              <ArrowLeft className="w-4 h-4 text-slate-400" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
