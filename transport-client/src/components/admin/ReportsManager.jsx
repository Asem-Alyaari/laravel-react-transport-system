import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Ticket,
  Users,
  Percent,
  Bus,
  Calendar,
  Clock,
  CreditCard,
  Wallet,
  Banknote,
  CheckCircle2,
  Printer,
  RefreshCw,
  FileText,
  ArrowLeft,
  Phone,
  Filter,
} from 'lucide-react';
import api from '../../api/axios';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui/table';
import { cn } from '../../lib/utils';

// ==========================================
// البيانات النموذجية الافتراضية (Fallback Mock Data)
// ==========================================
const DEFAULT_SUMMARY = {
  total_revenue: 148750,
  today_revenue: 12400,
  total_bookings: 412,
  total_tickets: 745,
  total_passengers: 745,
  average_ticket_fare: 199.6,
  average_occupancy_rate: 84.8,
  completed_trips: 54,
  scheduled_trips: 62,
  active_buses: 18,
  payment_methods_breakdown: {
    mada: { count: 410, amount: 81812, percentage: 55.0 },
    visa_mastercard: { count: 260, amount: 52062, percentage: 35.0 },
    cash: { count: 75, amount: 14876, percentage: 10.0 },
  },
};

const DEFAULT_CHART_DATA = [
  { date: '2026-10-13', date_label: 'الإثنين 13/10', revenue: 16200, bookings_count: 45, tickets_count: 82 },
  { date: '2026-10-14', date_label: 'الثلاثاء 14/10', revenue: 19400, bookings_count: 52, tickets_count: 98 },
  { date: '2026-10-15', date_label: 'الأربعاء 15/10', revenue: 17800, bookings_count: 48, tickets_count: 89 },
  { date: '2026-10-16', date_label: 'الخميس 16/10', revenue: 26500, bookings_count: 76, tickets_count: 135 },
  { date: '2026-10-17', date_label: 'الجمعة 17/10', revenue: 29800, bookings_count: 84, tickets_count: 148 },
  { date: '2026-10-18', date_label: 'السبت 18/10', revenue: 22100, bookings_count: 59, tickets_count: 104 },
  { date: '2026-10-19', date_label: 'اليوم (الأحد)', revenue: 16950, bookings_count: 48, tickets_count: 89 },
];

const DEFAULT_ROUTES_PERFORMANCE = [
  {
    route_id: 1,
    route_name: 'الرياض - جدة السريع',
    origin_city: 'الرياض',
    destination_city: 'جدة',
    trips_count: 24,
    passengers_count: 312,
    total_revenue: 68640,
    average_occupancy_rate: 89.2,
  },
  {
    route_id: 2,
    route_name: 'مكة المكرمة - المدينة المنورة (VIP)',
    origin_city: 'مكة المكرمة',
    destination_city: 'المدينة المنورة',
    trips_count: 18,
    passengers_count: 234,
    total_revenue: 42120,
    average_occupancy_rate: 86.7,
  },
  {
    route_id: 3,
    route_name: 'الدمام - الرياض المباشر',
    origin_city: 'الدمام',
    destination_city: 'الرياض',
    trips_count: 14,
    passengers_count: 145,
    total_revenue: 26100,
    average_occupancy_rate: 74.0,
  },
  {
    route_id: 4,
    route_name: 'الرياض - أبها الجبلي',
    origin_city: 'الرياض',
    destination_city: 'أبها',
    trips_count: 6,
    passengers_count: 54,
    total_revenue: 11890,
    average_occupancy_rate: 60.0,
  },
];

const DEFAULT_MANIFEST = {
  trip: {
    id: 101,
    trip_code: 'TRP-1049',
    departure_datetime: '2026-10-20T08:00:00Z',
    arrival_datetime: '2026-10-20T16:30:00Z',
    base_fare: 220,
    status: 'scheduled',
  },
  route: {
    id: 1,
    name: 'الرياض - جدة السريع',
    origin_city: 'الرياض',
    destination_city: 'جدة',
    origin_station_name: 'محطة الرياض المركزية (العزيزية)',
    destination_station_name: 'محطة جدة الرئيسية (طريق الحرمين)',
  },
  bus: {
    id: 1,
    bus_number: 'BUS-102',
    plate_number: 'أ ب ج 7741',
    model: 'مرسيدس ترافيكو 2024 VIP',
    bus_type: 'vip',
    total_seats: 40,
  },
  driver: {
    id: 1,
    name: 'سليمان خالد العتيبي',
    phone_number: '0501234567',
    license_number: 'DL-99412',
  },
  total_seats: 40,
  booked_seats: 36,
  occupancy_rate: 90.0,
  manifest_passengers: [
    {
      seat_number: '01A',
      ticket_number: 'TKT-2026-001',
      passenger_name: 'عبدالله محمد السعيد',
      national_id: '1098234561',
      phone_number: '0551122334',
      origin_station: 'الرياض - العزيزية',
      destination_station: 'جدة - الحرمين',
      fare: 220,
      status: 'boarded',
    },
    {
      seat_number: '01B',
      ticket_number: 'TKT-2026-002',
      passenger_name: 'فاطمة أحمد العلي',
      national_id: '1087456123',
      phone_number: '0509988776',
      origin_station: 'الرياض - العزيزية',
      destination_station: 'جدة - الحرمين',
      fare: 220,
      status: 'boarded',
    },
    {
      seat_number: '02A',
      ticket_number: 'TKT-2026-003',
      passenger_name: 'سعود بن فهد القحطاني',
      national_id: '1076123987',
      phone_number: '0567788990',
      origin_station: 'الرياض - العزيزية',
      destination_station: 'الطائف - المحطة الوسيطة',
      fare: 180,
      status: 'boarded',
    },
    {
      seat_number: '02B',
      ticket_number: 'TKT-2026-004',
      passenger_name: 'خالد عبدالعزيز الشهري',
      national_id: '1065432198',
      phone_number: '0543322110',
      origin_station: 'الرياض - العزيزية',
      destination_station: 'جدة - الحرمين',
      fare: 220,
      status: 'confirmed',
    },
    {
      seat_number: '03A',
      ticket_number: 'TKT-2026-005',
      passenger_name: 'منيرة ناصر الدوسري',
      national_id: '1054321876',
      phone_number: '0534455667',
      origin_station: 'الرياض - العزيزية',
      destination_station: 'جدة - الحرمين',
      fare: 220,
      status: 'confirmed',
    },
    {
      seat_number: '03B',
      ticket_number: 'TKT-2026-006',
      passenger_name: 'طارق سلطان الحربي',
      national_id: '1043210987',
      phone_number: '0521133557',
      origin_station: 'الرياض - العزيزية',
      destination_station: 'جدة - الحرمين',
      fare: 220,
      status: 'confirmed',
    },
    {
      seat_number: '04A',
      ticket_number: 'TKT-2026-007',
      passenger_name: 'عمر ياسين الشمري',
      national_id: '1032109876',
      phone_number: '0519988442',
      origin_station: 'الرياض - العزيزية',
      destination_station: 'جدة - الحرمين',
      fare: 220,
      status: 'confirmed',
    },
    {
      seat_number: '04B',
      ticket_number: 'TKT-2026-008',
      passenger_name: 'ريما فهد التميمي',
      national_id: '1021098765',
      phone_number: '0507766554',
      origin_station: 'الرياض - العزيزية',
      destination_station: 'جدة - الحرمين',
      fare: 220,
      status: 'confirmed',
    },
  ],
};

// مساعدة حساب درجات شريط التقدم بنقاء Tailwind ودون inline styles
const getProgressWidthClass = (rate) => {
  const r = Math.min(100, Math.max(0, Math.round(rate)));
  if (r >= 95) return 'w-[95%]';
  if (r >= 90) return 'w-[90%]';
  if (r >= 85) return 'w-[85%]';
  if (r >= 80) return 'w-[80%]';
  if (r >= 75) return 'w-[75%]';
  if (r >= 70) return 'w-[70%]';
  if (r >= 65) return 'w-[65%]';
  if (r >= 60) return 'w-[60%]';
  if (r >= 55) return 'w-[55%]';
  if (r >= 50) return 'w-[50%]';
  if (r >= 45) return 'w-[45%]';
  if (r >= 40) return 'w-[40%]';
  if (r >= 35) return 'w-[35%]';
  if (r >= 30) return 'w-[30%]';
  if (r >= 25) return 'w-[25%]';
  if (r >= 20) return 'w-[20%]';
  if (r >= 15) return 'w-[15%]';
  if (r >= 10) return 'w-[10%]';
  if (r >= 5) return 'w-[5%]';
  return 'w-0';
};

export default function ReportsManager() {
  // 1. التبويب الحالي والفلاتر
  const [tab, setTab] = useState('analytics'); // 'analytics' | 'manifest'
  const [period, setPeriod] = useState('7days'); // 'today' | '7days' | 'month' | 'all'
  const [routeId, setRouteId] = useState('');

  // 2. حالات البيانات
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [chartData, setChartData] = useState(DEFAULT_CHART_DATA);
  const [routesPerformance, setRoutesPerformance] = useState(DEFAULT_ROUTES_PERFORMANCE);
  const [routesList, setRoutesList] = useState([]);
  const [tripsList, setTripsList] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [manifestData, setManifestData] = useState(DEFAULT_MANIFEST);

  // 3. حالات التحميل والتفاعل
  const [loading, setLoading] = useState(true);
  const [loadingManifest, setLoadingManifest] = useState(false);
  const [hoveredChartIndex, setHoveredChartIndex] = useState(null);
  const [chartMetric, setChartMetric] = useState('revenue'); // 'revenue' | 'bookings'

  // حساب تواريخ البداية والنهاية للفترة المختارة
  const getPeriodDateRange = (selectedPeriod) => {
    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const formatYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (selectedPeriod === 'today') {
      const todayStr = formatYMD(today);
      return { start_date: todayStr, end_date: todayStr };
    }
    if (selectedPeriod === '7days') {
      const start = new Date();
      start.setDate(today.getDate() - 6);
      return { start_date: formatYMD(start), end_date: formatYMD(today) };
    }
    if (selectedPeriod === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start_date: formatYMD(start), end_date: formatYMD(today) };
    }
    return { start_date: '', end_date: '' };
  };

  // جلب القوائم المنسدلة الأولية (المسارات والرحلات)
  useEffect(() => {
    // 1. جلب المسارات
    api
      .get('/routes')
      .then((res) => {
        const data = res.data?.status === 'success' ? res.data.data : res.data;
        if (Array.isArray(data) && data.length > 0) {
          setRoutesList(data);
        }
      })
      .catch((err) => {
        console.warn('لم يتمكن من جلب المسارات من الخادم، استخدام القائمة المحلية:', err);
      });

    // 2. جلب الرحلات للـ Manifest
    api
      .get('/trips')
      .then((res) => {
        const data = res.data?.status === 'success' ? res.data.data : res.data;
        if (Array.isArray(data) && data.length > 0) {
          setTripsList(data);
          setSelectedTripId(String(data[0].id));
        }
      })
      .catch((err) => {
        console.warn('لم يتمكن من جلب الرحلات من الخادم، استخدام القائمة الافتراضية:', err);
        // قائمة احتياطية
        const fallbackTrips = [
          {
            id: 101,
            trip_code: 'TRP-1049',
            route_name: 'الرياض - جدة السريع',
            departure_datetime: '2026-10-20T08:00:00Z',
          },
          {
            id: 102,
            trip_code: 'TRP-1050',
            route_name: 'مكة المكرمة - المدينة المنورة (VIP)',
            departure_datetime: '2026-10-20T10:30:00Z',
          },
          {
            id: 103,
            trip_code: 'TRP-1051',
            route_name: 'الدمام - الرياض المباشر',
            departure_datetime: '2026-10-20T14:00:00Z',
          },
        ];
        setTripsList(fallbackTrips);
        setSelectedTripId('101');
      });
  }, []);

  // جلب بيانات لوحة التقارير والتحليلات
  const fetchAnalyticsData = () => {
    setLoading(true);
    const { start_date, end_date } = getPeriodDateRange(period);

    const params = {
      start_date: start_date || undefined,
      end_date: end_date || undefined,
      route_id: routeId || undefined,
    };

    Promise.all([
      api.get('/reports/summary', { params }).catch(() => null),
      api.get('/reports/revenue-chart', { params }).catch(() => null),
      api.get('/reports/routes-performance', { params: { start_date: params.start_date, end_date: params.end_date } }).catch(() => null),
    ])
      .then(([summaryRes, chartRes, routesRes]) => {
        // 1. الملخص
        if (summaryRes?.data) {
          const sData = summaryRes.data?.status === 'success' ? summaryRes.data.data : summaryRes.data;
          if (sData && typeof sData.total_revenue !== 'undefined') {
            setSummary(sData);
          } else {
            setSummary(DEFAULT_SUMMARY);
          }
        } else {
          setSummary(DEFAULT_SUMMARY);
        }

        // 2. منحنى الإيرادات
        if (chartRes?.data) {
          const cData = chartRes.data?.status === 'success' ? chartRes.data.data : chartRes.data;
          if (Array.isArray(cData) && cData.length > 0) {
            setChartData(cData);
          } else {
            setChartData(DEFAULT_CHART_DATA);
          }
        } else {
          setChartData(DEFAULT_CHART_DATA);
        }

        // 3. أداء المسارات
        if (routesRes?.data) {
          const rData = routesRes.data?.status === 'success' ? routesRes.data.data : routesRes.data;
          if (Array.isArray(rData) && rData.length > 0) {
            setRoutesPerformance(rData);
          } else {
            setRoutesPerformance(DEFAULT_ROUTES_PERFORMANCE);
          }
        } else {
          setRoutesPerformance(DEFAULT_ROUTES_PERFORMANCE);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // إعادة الجلب عند تغيير الفلترة
  useEffect(() => {
    fetchAnalyticsData();
  }, [period, routeId]);

  // جلب كشف ركاب الرحلة عند اختيار رحلة
  useEffect(() => {
    if (!selectedTripId) return;

    setLoadingManifest(true);
    api
      .get(`/reports/trip-manifest/${selectedTripId}`)
      .then((res) => {
        const data = res.data?.status === 'success' ? res.data.data : res.data;
        if (data && data.manifest_passengers) {
          setManifestData(data);
        } else {
          // محاكاة كشف تفاعلي بالاعتماد على الرحلة المختارة
          const tripFound = tripsList.find((t) => String(t.id) === String(selectedTripId));
          setManifestData({
            ...DEFAULT_MANIFEST,
            trip: {
              ...DEFAULT_MANIFEST.trip,
              id: tripFound?.id || selectedTripId,
              trip_code: tripFound?.trip_code || `TRP-${selectedTripId}`,
              departure_datetime: tripFound?.departure_datetime || DEFAULT_MANIFEST.trip.departure_datetime,
            },
            route: {
              ...DEFAULT_MANIFEST.route,
              name: tripFound?.route_name || DEFAULT_MANIFEST.route.name,
            },
          });
        }
      })
      .catch((err) => {
        console.warn('لم يتمكن من جلب كشف الركاب من الخادم، استخدام النموذج الافتراضي:', err);
        const tripFound = tripsList.find((t) => String(t.id) === String(selectedTripId));
        setManifestData({
          ...DEFAULT_MANIFEST,
          trip: {
            ...DEFAULT_MANIFEST.trip,
            id: tripFound?.id || selectedTripId,
            trip_code: tripFound?.trip_code || `TRP-${selectedTripId}`,
            departure_datetime: tripFound?.departure_datetime || DEFAULT_MANIFEST.trip.departure_datetime,
          },
          route: {
            ...DEFAULT_MANIFEST.route,
            name: tripFound?.route_name || DEFAULT_MANIFEST.route.name,
          },
        });
      })
      .finally(() => {
        setLoadingManifest(false);
      });
  }, [selectedTripId, tripsList]);

  // أمر الطباعة
  const handlePrint = () => {
    window.print();
  };

  // تنسيق التاريخ والوقت العربي
  const formatArabicDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // إعدادات المنحنى البياني التفاعلي (Custom SVG Chart Calculations)
  const chartMetricsCalculations = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;

    const maxRev = Math.max(...chartData.map((d) => d.revenue || 0), 1000);
    const maxBook = Math.max(...chartData.map((d) => d.bookings_count || 0), 10);

    // مضاعفات الأرقام لتنسيق شبكة المحاور
    const roundedMaxRevenue = Math.ceil(maxRev / 5000) * 5000;
    const roundedMaxBookings = Math.ceil(maxBook / 10) * 10;

    const width = 760;
    const height = 240;
    const paddingLeft = 55;
    const paddingRight = 25;
    const paddingTop = 25;
    const paddingBottom = 40;

    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;

    const n = chartData.length;
    const colStep = graphWidth / Math.max(1, n);
    const barWidth = Math.min(36, colStep * 0.55);

    const points = chartData.map((item, idx) => {
      const cx = paddingLeft + (idx + 0.5) * colStep;
      const revRatio = Math.min(1, Math.max(0, (item.revenue || 0) / roundedMaxRevenue));
      const bookRatio = Math.min(1, Math.max(0, (item.bookings_count || 0) / roundedMaxBookings));

      const revY = paddingTop + graphHeight - revRatio * graphHeight;
      const bookY = paddingTop + graphHeight - bookRatio * graphHeight;

      const barHeight = revRatio * graphHeight;
      const barY = paddingTop + graphHeight - barHeight;
      const barX = cx - barWidth / 2;

      return {
        ...item,
        index: idx,
        cx,
        revY,
        bookY,
        barX,
        barY,
        barWidth,
        barHeight,
      };
    });

    // خطوط المنحنى
    const revLinePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.cx} ${p.revY}`).join(' ');
    const revAreaPath = `${revLinePath} L ${points[points.length - 1].cx} ${paddingTop + graphHeight} L ${points[0].cx} ${paddingTop + graphHeight} Z`;

    const bookLinePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.cx} ${p.bookY}`).join(' ');

    return {
      width,
      height,
      paddingLeft,
      paddingTop,
      graphWidth,
      graphHeight,
      roundedMaxRevenue,
      roundedMaxBookings,
      points,
      revLinePath,
      revAreaPath,
      bookLinePath,
    };
  }, [chartData]);

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* ترويسة الصفحة وشريط التبويبات والأدوات (Header & Toolbar) */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 print:hidden">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                التقارير والتحليلات المالية والتشغيلية
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                متابعة حركة الإيرادات، التذاكر، كفاءة إشغال الأسطول، وإصدار كشوفات ركاب الرحلات الرسمية
              </p>
            </div>
          </div>
        </div>

        {/* أزرار التبديل بين التبويبين وزر الطباعة والتحديث */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setTab('analytics')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer',
                tab === 'analytics'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'hover:text-slate-900 text-slate-600'
              )}
            >
              <BarChart3 className="w-4 h-4" />
              <span>لوحة المؤشرات والتحليلات</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('manifest')}
              className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer',
                tab === 'manifest'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'hover:text-slate-900 text-slate-600'
              )}
            >
              <FileText className="w-4 h-4" />
              <span>كشف ركاب الرحلة (Manifest)</span>
            </button>
          </div>

          {/* زر الطباعة / التصدير */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="border-slate-200 text-slate-700 hover:bg-slate-100 gap-1.5"
            title="طباعة التقرير / كشف الركاب"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>طباعة / تصدير</span>
          </Button>

          {/* زر التحديث */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalyticsData}
            disabled={loading}
            className="border-slate-200 text-slate-700 hover:bg-slate-100 gap-1.5"
            title="تحديث البيانات"
          >
            <RefreshCw className={cn('w-4 h-4 text-slate-500', loading && 'animate-spin text-blue-600')} />
            <span className="hidden sm:inline">تحديث</span>
          </Button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* شريط الفلاتر السريعة (يظهر في تبويب التحليلات)             */}
      {/* ========================================================= */}
      {tab === 'analytics' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs print:hidden">
          {/* أزرار الفترات الزمنية الجاهزة */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-500 ml-1.5 flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>الفترة:</span>
            </span>
            {[
              { id: 'today', label: 'اليوم' },
              { id: '7days', label: 'آخر 7 أيام' },
              { id: 'month', label: 'هذا الشهر' },
              { id: 'all', label: 'الكل' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0',
                  period === p.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* فلتر المسار */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>المسار:</span>
            </span>
            <select
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              className="h-9 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[180px]"
            >
              <option value="">جميع مسارات التشغيل</option>
              {routesList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* التبويب الأول: لوحة المؤشرات والتحليلات (Analytics Dashboard) */}
      {/* ========================================================= */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          {/* 1. مؤشرات الأداء الرئيسية العليا (Top 4 KPI Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. إجمالي الإيرادات */}
            <Card className="p-5 flex items-center gap-4 hover:shadow-md transition-all border-slate-200/90">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <DollarSign className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500">إجمالي الإيرادات</span>
                  <Badge variant="success" className="text-[10px] px-1.5 py-0">
                    ر.س
                  </Badge>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5 truncate">
                  {Number(summary.total_revenue || 0).toLocaleString()}
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700 block mt-0.5">
                  المحصل لكافة الحجوزات المؤكدة
                </span>
              </div>
            </Card>

            {/* 2. التذاكر الصادرة */}
            <Card className="p-5 flex items-center gap-4 hover:shadow-md transition-all border-slate-200/90">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                <Ticket className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-500">التذاكر الصادرة</span>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5 truncate">
                  {Number(summary.total_tickets || 0).toLocaleString()}
                </h3>
                <span className="text-[11px] font-semibold text-blue-700 block mt-0.5">
                  تذكرة مقعد إلكترونية مؤكدة
                </span>
              </div>
            </Card>

            {/* 3. إجمالي الركاب */}
            <Card className="p-5 flex items-center gap-4 hover:shadow-md transition-all border-slate-200/90">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                <Users className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-500">إجمالي المسافرين</span>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5 truncate">
                  {Number(summary.total_passengers || 0).toLocaleString()}
                </h3>
                <span className="text-[11px] font-semibold text-indigo-700 block mt-0.5">
                  مسافر منقول عبر شبكة الأسطول
                </span>
              </div>
            </Card>

            {/* 4. متوسط نسبة الإشغال */}
            <Card className="p-5 flex items-center gap-4 hover:shadow-md transition-all border-slate-200/90">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                <Percent className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-500">متوسط نسبة الإشغال</span>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5 truncate">
                  {Number(summary.average_occupancy_rate || 0).toFixed(1)}%
                </h3>
                <span className="text-[11px] font-semibold text-amber-700 block mt-0.5">
                  كفاءة ملء مقاعد الحافلات
                </span>
              </div>
            </Card>
          </div>

          {/* 2. شريط المؤشرات الثانوية (3 Secondary Metrics) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-slate-50/70 border-slate-200/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500">إيرادات اليوم</span>
                    <div className="text-lg font-black text-slate-900">
                      {Number(summary.today_revenue || 0).toLocaleString()} ر.س
                    </div>
                  </div>
                </div>
                <Badge variant="success" className="text-[11px]">
                  مباشر
                </Badge>
              </div>
            </Card>

            <Card className="p-4 bg-slate-50/70 border-slate-200/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500">متوسط قيمة التذكرة</span>
                    <div className="text-lg font-black text-slate-900">
                      {Number(summary.average_ticket_fare || 0).toFixed(1)} ر.س
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[11px]">
                  معدل التذكرة
                </Badge>
              </div>
            </Card>

            <Card className="p-4 bg-slate-50/70 border-slate-200/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500">الرحلات المنفذة vs المجدولة</span>
                    <div className="text-lg font-black text-slate-900">
                      {summary.completed_trips || 0} من {summary.scheduled_trips || 0} رحلة
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[11px] font-bold text-slate-700 bg-white">
                  {summary.active_buses || 0} حافلة نشطة
                </Badge>
              </div>
            </Card>
          </div>

          {/* 3. الرسوم البيانية التفاعلية وقنوات الدفع (Charts & Payment Breakdown) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* أ. منحنى الإيرادات وحركة الحجوزات (Custom SVG Chart) */}
            <Card className="lg:col-span-2 overflow-hidden shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between py-4 px-6 bg-slate-50/60 border-b border-slate-100">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>منحنى الإيرادات وحركة الحجوزات اليومية</span>
                  </CardTitle>
                  <CardDescription className="mt-0.5">
                    تتبع يومي لحجم المبيعات المحصلة وأعداد التذاكر المباعة
                  </CardDescription>
                </div>

                {/* مفتاح التبديل بين الإيراد وعدد الحجوزات */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setChartMetric('revenue')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg transition-all cursor-pointer',
                      chartMetric === 'revenue'
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    الإيرادات (ر.س)
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMetric('bookings')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg transition-all cursor-pointer',
                      chartMetric === 'bookings'
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    الحجوزات
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {chartMetricsCalculations ? (
                  <div className="relative">
                    {/* نافذة التلميح التفاعلية (Floating Tooltip) */}
                    {hoveredChartIndex !== null && chartMetricsCalculations.points[hoveredChartIndex] && (
                      <div className="mb-3 p-3 rounded-xl bg-slate-900 text-white shadow-lg flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-2 font-bold">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span>{chartMetricsCalculations.points[hoveredChartIndex].date_label}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">الإيراد:</span>
                            <span className="font-black text-emerald-400">
                              {Number(chartMetricsCalculations.points[hoveredChartIndex].revenue).toLocaleString()} ر.س
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">الحجوزات:</span>
                            <span className="font-black text-blue-300">
                              {chartMetricsCalculations.points[hoveredChartIndex].bookings_count} حجز
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">التذاكر:</span>
                            <span className="font-black text-indigo-300">
                              {chartMetricsCalculations.points[hoveredChartIndex].tickets_count} تذكرة
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* رسم SVG البياني المطور */}
                    <div className="w-full overflow-x-auto">
                      <svg
                        viewBox={`0 0 ${chartMetricsCalculations.width} ${chartMetricsCalculations.height}`}
                        className="w-full h-auto min-w-[580px] select-none"
                      >
                        <defs>
                          <linearGradient id="revenueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.3" />
                          </linearGradient>
                          <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="1" />
                            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.6" />
                          </linearGradient>
                        </defs>

                        {/* شبكة الخطوط الأفقية وقيم المحور الصادي */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                          const y =
                            chartMetricsCalculations.paddingTop +
                            chartMetricsCalculations.graphHeight * (1 - ratio);
                          const revVal = Math.round(
                            chartMetricsCalculations.roundedMaxRevenue * ratio
                          );
                          const bookVal = Math.round(
                            chartMetricsCalculations.roundedMaxBookings * ratio
                          );
                          return (
                            <g key={i}>
                              <line
                                x1={chartMetricsCalculations.paddingLeft}
                                y1={y}
                                x2={
                                  chartMetricsCalculations.paddingLeft +
                                  chartMetricsCalculations.graphWidth
                                }
                                y2={y}
                                stroke="#e2e8f0"
                                strokeDasharray="4 4"
                                strokeWidth="1"
                              />
                              <text
                                x={chartMetricsCalculations.paddingLeft - 8}
                                y={y + 3}
                                textAnchor="end"
                                fontSize="10"
                                fill="#64748b"
                                fontWeight="bold"
                              >
                                {chartMetric === 'revenue'
                                  ? `${revVal >= 1000 ? `${revVal / 1000}k` : revVal}`
                                  : bookVal}
                              </text>
                            </g>
                          );
                        })}

                        {/* أعمدة البار اليومية (Interactive Columns) */}
                        {chartMetricsCalculations.points.map((p, idx) => {
                          const isHovered = hoveredChartIndex === idx;
                          return (
                            <g
                              key={`bar-${idx}`}
                              onMouseEnter={() => setHoveredChartIndex(idx)}
                              onMouseLeave={() => setHoveredChartIndex(null)}
                              className="cursor-pointer"
                            >
                              {/* عمود التفاعل الشفاف لكامل الارتفاع لتسهيل التمرير */}
                              <rect
                                x={p.cx - p.barWidth}
                                y={chartMetricsCalculations.paddingTop}
                                width={p.barWidth * 2}
                                height={chartMetricsCalculations.graphHeight}
                                fill="transparent"
                              />

                              {/* عمود القيمة */}
                              <rect
                                x={p.barX}
                                y={p.barY}
                                width={p.barWidth}
                                height={Math.max(2, p.barHeight)}
                                rx="5"
                                fill={isHovered ? 'url(#barGradHover)' : 'url(#barGrad)'}
                                className="transition-all duration-200"
                              />
                            </g>
                          );
                        })}

                        {/* مساحة المنحنى المعبأة تحت الخط */}
                        {chartMetric === 'revenue' && (
                          <path
                            d={chartMetricsCalculations.revAreaPath}
                            fill="url(#revenueAreaGrad)"
                          />
                        )}

                        {/* خط المنحنى للإيرادات */}
                        {chartMetric === 'revenue' && (
                          <path
                            d={chartMetricsCalculations.revLinePath}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}

                        {/* خط المنحنى للحجوزات */}
                        {chartMetric === 'bookings' && (
                          <path
                            d={chartMetricsCalculations.bookLinePath}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}

                        {/* نقاط القمم وأسماء الأيام على المحور السيني */}
                        {chartMetricsCalculations.points.map((p, idx) => {
                          const isHovered = hoveredChartIndex === idx;
                          const activeY = chartMetric === 'revenue' ? p.revY : p.bookY;
                          const dotColor = chartMetric === 'revenue' ? '#10b981' : '#3b82f6';
                          return (
                            <g
                              key={`dot-${idx}`}
                              onMouseEnter={() => setHoveredChartIndex(idx)}
                              onMouseLeave={() => setHoveredChartIndex(null)}
                              className="cursor-pointer"
                            >
                              {/* خط إرشادي عمودي عند التحويم */}
                              {isHovered && (
                                <line
                                  x1={p.cx}
                                  y1={chartMetricsCalculations.paddingTop}
                                  x2={p.cx}
                                  y2={
                                    chartMetricsCalculations.paddingTop +
                                    chartMetricsCalculations.graphHeight
                                  }
                                  stroke="#94a3b8"
                                  strokeDasharray="3 3"
                                  strokeWidth="1.5"
                                />
                              )}

                              {/* النقطة */}
                              <circle
                                cx={p.cx}
                                cy={activeY}
                                r={isHovered ? '6' : '4'}
                                fill="#ffffff"
                                stroke={dotColor}
                                strokeWidth={isHovered ? '3' : '2'}
                                className="transition-all duration-150"
                              />

                              {/* تسمية التاريخ تحت كل نقطة */}
                              <text
                                x={p.cx}
                                y={
                                  chartMetricsCalculations.paddingTop +
                                  chartMetricsCalculations.graphHeight +
                                  18
                                }
                                textAnchor="middle"
                                fontSize="11"
                                fill={isHovered ? '#1e293b' : '#64748b'}
                                fontWeight={isHovered ? 'bold' : 'normal'}
                              >
                                {p.date_label}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    <div className="flex items-center justify-center gap-6 mt-3 text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                        <span>منحنى الإيراد (SAR)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-md bg-blue-600 inline-block" />
                        <span>أعمدة الحجوزات اليومية</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    لا تتوفر بيانات كافية لرسم المنحنى في الفترة المحددة
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ب. توزيع قنوات وطرق الدفع (Payment Methods Breakdown) */}
            <Card className="overflow-hidden shadow-xs flex flex-col justify-between">
              <div>
                <CardHeader className="py-4 px-6 bg-slate-50/60 border-b border-slate-100">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-blue-600" />
                    <span>توزيع قنوات وطرق الدفع</span>
                  </CardTitle>
                  <CardDescription>
                    حصة العمليات والمدفوعات المحصلة إلكترونياً ونقداً
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 space-y-5">
                  {/* شريط مركب متعدد الألوان للحصص الإجمالية */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                      <span>النسبة المئوية للحصص</span>
                      <span>100% المحصل</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 flex overflow-hidden p-0.5 border border-slate-200">
                      <div
                        className={cn(
                          'h-full rounded-r-full bg-emerald-500 transition-all duration-300',
                          getProgressWidthClass(
                            summary.payment_methods_breakdown?.mada?.percentage || 55
                          )
                        )}
                        title="مدى"
                      />
                      <div
                        className={cn(
                          'h-full bg-blue-500 transition-all duration-300',
                          getProgressWidthClass(
                            summary.payment_methods_breakdown?.visa_mastercard?.percentage || 35
                          )
                        )}
                        title="فيزا / ماستر كارد"
                      />
                      <div
                        className={cn(
                          'h-full rounded-l-full bg-amber-500 transition-all duration-300',
                          getProgressWidthClass(
                            summary.payment_methods_breakdown?.cash?.percentage || 10
                          )
                        )}
                        title="نقدي"
                      />
                    </div>
                  </div>

                  {/* قائمة الطرق التفصيلية */}
                  <div className="space-y-4">
                    {/* مدى */}
                    <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900">
                              بطاقات مدى البنكية (Mada)
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {summary.payment_methods_breakdown?.mada?.count || 410} عملية دفع
                            </div>
                          </div>
                        </div>
                        <div className="text-left">
                          <span className="font-black text-sm text-slate-900">
                            {Number(
                              summary.payment_methods_breakdown?.mada?.amount || 81812
                            ).toLocaleString()}{' '}
                            ر.س
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 block">
                            {summary.payment_methods_breakdown?.mada?.percentage || 55.0}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full bg-emerald-500',
                            getProgressWidthClass(
                              summary.payment_methods_breakdown?.mada?.percentage || 55
                            )
                          )}
                        />
                      </div>
                    </div>

                    {/* فيزا وماستر كارد */}
                    <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900">
                              البطاقات الائتمانية (Visa / MC)
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {summary.payment_methods_breakdown?.visa_mastercard?.count || 260} عملية
                              دفع
                            </div>
                          </div>
                        </div>
                        <div className="text-left">
                          <span className="font-black text-sm text-slate-900">
                            {Number(
                              summary.payment_methods_breakdown?.visa_mastercard?.amount || 52062
                            ).toLocaleString()}{' '}
                            ر.س
                          </span>
                          <span className="text-[11px] font-bold text-blue-700 block">
                            {summary.payment_methods_breakdown?.visa_mastercard?.percentage || 35.0}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full bg-blue-500',
                            getProgressWidthClass(
                              summary.payment_methods_breakdown?.visa_mastercard?.percentage || 35
                            )
                          )}
                        />
                      </div>
                    </div>

                    {/* الدفع النقدي في المحطات */}
                    <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                            <Banknote className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900">
                              الدفع النقدي بالمحطة (Cash)
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {summary.payment_methods_breakdown?.cash?.count || 75} عملية دفع
                            </div>
                          </div>
                        </div>
                        <div className="text-left">
                          <span className="font-black text-sm text-slate-900">
                            {Number(
                              summary.payment_methods_breakdown?.cash?.amount || 14876
                            ).toLocaleString()}{' '}
                            ر.س
                          </span>
                          <span className="text-[11px] font-bold text-amber-700 block">
                            {summary.payment_methods_breakdown?.cash?.percentage || 10.0}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full bg-amber-500',
                            getProgressWidthClass(
                              summary.payment_methods_breakdown?.cash?.percentage || 10
                            )
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="p-4 bg-slate-50/80 border-t border-slate-100 text-center">
                <span className="text-xs font-semibold text-slate-500">
                  إجمالي العمليات المحصلة:{' '}
                  <strong className="text-slate-800">
                    {(summary.payment_methods_breakdown?.mada?.count || 0) +
                      (summary.payment_methods_breakdown?.visa_mastercard?.count || 0) +
                      (summary.payment_methods_breakdown?.cash?.count || 0)}{' '}
                    عملية
                  </strong>
                </span>
              </div>
            </Card>
          </div>

          {/* 4. جدول كفاءة وأداء المسارات (Routes Performance Table) */}
          <Card className="overflow-hidden shadow-xs">
            <CardHeader className="py-4 px-6 bg-slate-50/60 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bus className="w-4 h-4 text-blue-600" />
                    <span>تحليل كفاءة وأداء المسارات التشغيلية</span>
                  </CardTitle>
                  <CardDescription>
                    إحصائيات تفصيلية لعدد الرحلات، الركاب المنقولين، والإيراد المحقق ومعدل الإشغال
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-semibold text-xs bg-white text-slate-700">
                  {routesPerformance.length} مسار نشط
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المسار</TableHead>
                    <TableHead>المدن (من - إلى)</TableHead>
                    <TableHead className="text-center">عدد الرحلات</TableHead>
                    <TableHead className="text-center">الركاب المنقولين</TableHead>
                    <TableHead className="text-left">الإيراد الإجمالي</TableHead>
                    <TableHead>نسبة الإشغال</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routesPerformance.map((route) => {
                    const occRate = Number(route.average_occupancy_rate || 0);
                    return (
                      <TableRow key={route.route_id}>
                        <TableCell className="font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                            <span>{route.route_name}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <span>{route.origin_city}</span>
                            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                            <span>{route.destination_city}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-bold">
                            {route.trips_count} رحلة
                          </Badge>
                        </TableCell>

                        <TableCell className="text-center font-bold text-slate-800">
                          {Number(route.passengers_count).toLocaleString()} مسافر
                        </TableCell>

                        <TableCell className="text-left">
                          <span className="font-black text-slate-900">
                            {Number(route.total_revenue).toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500 mr-1">ر.س</span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[140px]">
                            <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all duration-300',
                                  occRate >= 75
                                    ? 'bg-emerald-500'
                                    : occRate >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-slate-400',
                                  getProgressWidthClass(occRate)
                                )}
                              />
                            </div>
                            <span
                              className={cn(
                                'text-xs font-black min-w-[42px] text-left',
                                occRate >= 75
                                  ? 'text-emerald-700'
                                  : occRate >= 50
                                  ? 'text-amber-700'
                                  : 'text-slate-600'
                              )}
                            >
                              {occRate.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* التبويب الثاني: كشف ركاب الرحلة الرسمي (Passenger Manifest) */}
      {/* ========================================================= */}
      {tab === 'manifest' && (
        <div className="space-y-6">
          {/* محدد الرحلة (Trip Selector Bar) */}
          <Card className="p-5 shadow-xs border-slate-200/80 bg-white print:hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 max-w-xl">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اختر الرحلة لعرض كشف الركاب الرسمي (Passenger Manifest):
                </label>
                <div className="relative">
                  <select
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    className="w-full h-11 px-3.5 pr-10 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">-- اضغط لاختيار رحلة مجدولة --</option>
                    {tripsList.map((t) => (
                      <option key={t.id} value={t.id}>
                        #{t.trip_code || t.id} — {t.route_name || t.route?.name || 'رحلة بين المدن'} (
                        {formatArabicDateTime(t.departure_datetime)})
                      </option>
                    ))}
                  </select>
                  <Bus className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* أزرار الإجراء السريع */}
              <div className="flex items-center gap-2 pt-2 md:pt-0">
                <Button
                  onClick={handlePrint}
                  disabled={!selectedTripId}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 px-5"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة كشف ركاب الرحلة (A4)</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* محتوى كشف الركاب (Printable & Screen View) */}
          {loadingManifest ? (
            <Card className="p-16 text-center text-slate-500">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">جاري تحميل بيانات كشف ركاب الرحلة...</h3>
            </Card>
          ) : manifestData ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs print:border-none print:shadow-none print:m-0 print:p-0">
              {/* ترويسة رسمية خاصة بالطباعة (تظهر في الطباعة فقط) */}
              <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-black text-slate-900">سفريات النخبة لنقل الركاب</h1>
                    <p className="text-xs text-slate-600 font-bold mt-0.5">
                      كشف ركاب الرحلة الرسمي (Boarding & Passenger Manifest)
                    </p>
                  </div>
                  <div className="text-left text-xs font-bold text-slate-700">
                    <div>المملكة العربية السعودية</div>
                    <div>تاريخ الإصدار: {new Date().toLocaleDateString('ar-SA')}</div>
                  </div>
                </div>
              </div>

              {/* بنر تفاصيل الرحلة المحددة (Trip Details Banner) */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 print:bg-slate-50 print:border print:border-slate-300 print:rounded-lg print:mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-600 text-white font-black text-sm px-3 py-1">
                      {manifestData.trip?.trip_code || `TRP-${selectedTripId}`}
                    </Badge>
                    <h2 className="text-lg font-black text-slate-900">
                      {manifestData.route?.name || 'مسار الرحلة المجدولة'}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-bold text-xs bg-white text-slate-700">
                      {manifestData.bus?.bus_type === 'vip' ? 'حافلة VIP ملكية' : 'حافلة سياحية قياسية'}
                    </Badge>
                    <Badge variant="success" className="font-bold text-xs">
                      رحلة مجدولة مؤكدة
                    </Badge>
                  </div>
                </div>

                {/* شبكة البيانات التفصيلية للرحلة */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  {/* وقت المغادرة والوصول */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200/70 print:border-slate-300">
                    <span className="font-bold text-slate-500 block mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>توقيت المغادرة والوصول</span>
                    </span>
                    <div className="font-black text-slate-900 text-sm">
                      {formatArabicDateTime(manifestData.trip?.departure_datetime)}
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      وصول متوقع: {formatArabicDateTime(manifestData.trip?.arrival_datetime)}
                    </div>
                  </div>

                  {/* الحافلة واللوحة */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200/70 print:border-slate-300">
                    <span className="font-bold text-slate-500 block mb-1 flex items-center gap-1">
                      <Bus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>الحافلة والمركبة</span>
                    </span>
                    <div className="font-black text-slate-900 text-sm">
                      {manifestData.bus?.model || 'مرسيدس ترافيكو'}
                    </div>
                    <div className="text-slate-600 text-[11px] font-mono mt-0.5">
                      رقم اللوحة: {manifestData.bus?.plate_number || '—'}
                    </div>
                  </div>

                  {/* كابتن الرحلة */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200/70 print:border-slate-300">
                    <span className="font-bold text-slate-500 block mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-indigo-600" />
                      <span>قائد الحافلة (السائق)</span>
                    </span>
                    <div className="font-black text-slate-900 text-sm">
                      {manifestData.driver?.name || 'كابتن معتمد'}
                    </div>
                    <div className="text-slate-600 text-[11px] font-mono mt-0.5">
                      جوال: {manifestData.driver?.phone_number || '05XXXXXXXX'}
                    </div>
                  </div>

                  {/* نسبة الإشغال والمقاعد */}
                  <div className="p-3 rounded-xl bg-white border border-slate-200/70 print:border-slate-300">
                    <span className="font-bold text-slate-500 block mb-1 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-amber-600" />
                      <span>المقاعد ونسبة الإشغال</span>
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 text-sm">
                        {manifestData.booked_seats || manifestData.manifest_passengers?.length || 0} /{' '}
                        {manifestData.total_seats || 40} مقعد
                      </span>
                      <Badge
                        variant={
                          (manifestData.occupancy_rate || 90) >= 75 ? 'success' : 'warning'
                        }
                        className="text-[11px] font-bold"
                      >
                        {manifestData.occupancy_rate || 90}%
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      متبقي{' '}
                      {(manifestData.total_seats || 40) -
                        (manifestData.booked_seats || manifestData.manifest_passengers?.length || 0)}{' '}
                      مقعد شاغر
                    </div>
                  </div>
                </div>
              </div>

              {/* جدول كشف الركاب (Passenger Manifest Table) */}
              <div className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-100/80 print:bg-slate-200">
                      <TableHead className="w-16 text-center">المقعد</TableHead>
                      <TableHead>رقم التذكرة</TableHead>
                      <TableHead>اسم المسافر</TableHead>
                      <TableHead>الهوية الوطنية / الإقامة</TableHead>
                      <TableHead>رقم الجوال</TableHead>
                      <TableHead>محطة الركوب ⬅️ محطة النزول</TableHead>
                      <TableHead className="text-center">قيمة التذكرة</TableHead>
                      <TableHead className="text-center">حالة الصعود</TableHead>
                      <TableHead className="w-24 text-center print:table-cell hidden md:table-cell">
                        توقيع المسافر
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manifestData.manifest_passengers && manifestData.manifest_passengers.length > 0 ? (
                      manifestData.manifest_passengers.map((passenger, idx) => (
                        <TableRow key={idx} className="print:text-xs">
                          {/* المقعد */}
                          <TableCell className="text-center font-bold">
                            <Badge
                              variant="secondary"
                              className="font-mono font-black text-xs px-2.5 py-0.5 bg-blue-50 text-blue-800 border-blue-200"
                            >
                              {passenger.seat_number}
                            </Badge>
                          </TableCell>

                          {/* رقم التذكرة */}
                          <TableCell className="font-mono text-xs font-bold text-slate-700">
                            {passenger.ticket_number}
                          </TableCell>

                          {/* اسم المسافر */}
                          <TableCell className="font-bold text-slate-900">
                            {passenger.passenger_name}
                          </TableCell>

                          {/* رقم الهوية */}
                          <TableCell className="font-mono text-xs text-slate-600">
                            {passenger.national_id}
                          </TableCell>

                          {/* رقم الجوال */}
                          <TableCell className="font-mono text-xs text-slate-600">
                            {passenger.phone_number}
                          </TableCell>

                          {/* محطة الركوب والنزول */}
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                              <span>{passenger.origin_station}</span>
                              <ArrowLeft className="w-3 h-3 text-slate-400" />
                              <span>{passenger.destination_station}</span>
                            </div>
                          </TableCell>

                          {/* قيمة التذكرة */}
                          <TableCell className="text-center font-black text-slate-900">
                            {passenger.fare} ر.س
                          </TableCell>

                          {/* حالة الصعود */}
                          <TableCell className="text-center">
                            {passenger.status === 'boarded' ? (
                              <Badge variant="success" className="font-bold text-[11px]">
                                صعد للحافلة
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="font-bold text-[11px] text-blue-700 bg-blue-50/50">
                                مؤكد
                              </Badge>
                            )}
                          </TableCell>

                          {/* عمود التوقيع (مخصص للطباعة والاستلام الورقي) */}
                          <TableCell className="text-center print:table-cell hidden md:table-cell border-r border-slate-100">
                            <div className="h-6 border-b border-dashed border-slate-300" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                          لا يوجد مسافرون محجوزون على هذه الرحلة حتى الآن
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* ملخص إجمالي وتواقيع الاعتماد الرسمية (A4 Signatures Section) */}
              <div className="p-6 border-t border-slate-200/90 bg-slate-50/40 print:bg-white space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-4">
                    <span>
                      إجمالي ركاب الرحلة:{' '}
                      <strong className="text-slate-900 text-sm">
                        {manifestData.manifest_passengers?.length || 0} مسافر
                      </strong>
                    </span>
                    <span>
                      إجمالي قيمة التذاكر:{' '}
                      <strong className="text-emerald-700 text-sm">
                        {manifestData.manifest_passengers
                          ? manifestData.manifest_passengers.reduce((acc, p) => acc + (p.fare || 0), 0)
                          : 0}{' '}
                        ر.س
                      </strong>
                    </span>
                  </div>
                  <div className="text-slate-500">
                    كشف صادر وموثق إلكترونياً من نظام سفريات النخبة ELITE TRANSIT ERP
                  </div>
                </div>

                {/* خانات التوقيع المعتمدة للطباعة والاستلام الميداني */}
                <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-200 text-center">
                  <div className="p-3 border border-slate-200 rounded-xl bg-white print:border-slate-400">
                    <span className="block text-xs font-bold text-slate-600 mb-6">
                      توقيع كابتن الرحلة:
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono">...................................</div>
                  </div>

                  <div className="p-3 border border-slate-200 rounded-xl bg-white print:border-slate-400">
                    <span className="block text-xs font-bold text-slate-600 mb-6">
                      توقيع مشرف حركة المحطة:
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono">...................................</div>
                  </div>

                  <div className="p-3 border border-slate-200 rounded-xl bg-white print:border-slate-400">
                    <span className="block text-xs font-bold text-slate-600 mb-6">
                      ختم المحطة المعتمد:
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono">...................................</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Card className="p-16 text-center text-slate-400">
              <Bus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">يرجى اختيار رحلة لعرض كشف الركاب</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                حدد الرحلة المراد معاينة كشف ركابها من القائمة المنسدلة في الأعلى لاستعراض بيانات الركاب والطباعة.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
