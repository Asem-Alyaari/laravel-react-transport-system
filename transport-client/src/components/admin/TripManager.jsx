import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Search,
  Calendar,
  Clock,
  Bus,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Route as RouteIcon,
} from 'lucide-react';
import api from '../../api/axios';
import { Card, CardContent } from '../ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';

export default function TripManager() {
  // بيانات الرحلات والفلاتر
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [routeFilter, setRouteFilter] = useState('');

  // القوائم المنسدلة للنماذج
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // حالة نافذة الحوار (Modal)
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // نموذج البيانات
  const [formData, setFormData] = useState({
    route_id: '',
    bus_id: '',
    driver_id: '',
    departure_datetime: '',
    arrival_datetime: '',
    base_fare: '',
    status: 'scheduled',
    remarks: '',
  });

  // جلب قائمة الرحلات مع الفلاتر
  const fetchTrips = () => {
    setLoading(true);
    api
      .get('/trips', {
        params: {
          search: searchTerm || undefined,
          status: statusFilter || undefined,
          route_id: routeFilter || undefined,
        },
      })
      .then((res) => {
        if (res.data?.status === 'success') {
          setTrips(res.data.data || []);
        }
      })
      .catch((err) => console.error('خطأ في جلب بيانات الرحلات:', err))
      .finally(() => setLoading(false));
  };

  // جلب بيانات المسارات والحافلات والسائقين لتعبئة القوائم
  const fetchDropdownData = () => {
    // المسارات
    api
      .get('/routes')
      .then((res) => {
        if (res.data?.status === 'success') {
          setRoutes(res.data.data || []);
        }
      })
      .catch((err) => console.error('خطأ في جلب المسارات:', err));

    // الحافلات
    api
      .get('/buses')
      .then((res) => {
        if (res.data?.status === 'success') {
          setBuses(res.data.data || []);
        }
      })
      .catch((err) => console.error('خطأ في جلب الحافلات:', err));

    // السائقين
    api
      .get('/drivers')
      .then((res) => {
        if (res.data?.status === 'success') {
          setDrivers(res.data.data || []);
        }
      })
      .catch((err) => console.error('خطأ في جلب السائقين:', err));
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [statusFilter, routeFilter]);

  // دالة البحث اليدوي
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTrips();
  };

  // تحويل صيغة التاريخ لـ datetime-local (YYYY-MM-DDTHH:mm)
  const toDatetimeLocal = (dateStr) => {
    if (!dateStr) return '';
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // تنسيق التاريخ للعرض باللغة العربية
  const formatArabicDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // فتح نافذة الإضافة
  const handleOpenAdd = () => {
    setEditingTrip(null);
    setFormData({
      route_id: routes[0]?.id ? String(routes[0].id) : '',
      bus_id: buses[0]?.id ? String(buses[0].id) : '',
      driver_id: drivers[0]?.id ? String(drivers[0].id) : '',
      departure_datetime: '',
      arrival_datetime: '',
      base_fare: '',
      status: 'scheduled',
      remarks: '',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  // فتح نافذة التعديل
  const handleOpenEdit = (trip) => {
    setEditingTrip(trip);
    setFormData({
      route_id: trip.route_id || trip.route?.id || '',
      bus_id: trip.bus_id || trip.bus?.id || '',
      driver_id: trip.driver_id || trip.driver?.id || '',
      departure_datetime: toDatetimeLocal(trip.departure_datetime),
      arrival_datetime: toDatetimeLocal(trip.arrival_datetime),
      base_fare: trip.base_fare ?? '',
      status: trip.status || 'scheduled',
      remarks: trip.remarks || '',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  // حفظ بيانات الرحلة (إضافة / تعديل)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      if (editingTrip) {
        await api.put(`/trips/${editingTrip.id}`, formData);
        setSuccessMsg('تم تحديث بيانات الرحلة بنجاح');
      } else {
        await api.post('/trips', formData);
        setSuccessMsg('تمت جدولة الرحلة الجديدة بنجاح');
      }

      setShowModal(false);
      fetchTrips();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'حدث خطأ أثناء حفظ بيانات الرحلة');
    } finally {
      setSubmitting(false);
    }
  };

  // حذف الرحلة
  const handleDelete = async (trip) => {
    const code = trip.trip_code || `رقم #${trip.id}`;
    if (!window.confirm(`هل أنت متأكد من حذف الرحلة "${code}"؟`)) return;

    try {
      await api.delete(`/trips/${trip.id}`);
      setSuccessMsg('تم حذف الرحلة بنجاح');
      fetchTrips();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'تعذر حذف الرحلة');
    }
  };

  // تمثيل الشارات حسب حالة الرحلة
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="success">مجدولة</Badge>;
      case 'boarding':
        return <Badge variant="default">جاري الصعود</Badge>;
      case 'in_transit':
        return <Badge variant="warning">في الطريق</Badge>;
      case 'completed':
        return <Badge variant="secondary">مكتملة</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">ملغاة</Badge>;
      default:
        return <Badge variant="secondary">{status || 'غير محدد'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. إشعار النجاح */}
      {successMsg && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. شريط الأدوات والبحث والفلترة */}
      <Card>
        <CardContent className="p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full lg:max-w-md">
            <Input
              type="text"
              placeholder="بحث برمز الرحلة أو اسم المسار..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10"
            />
            <Button type="submit" variant="secondary" className="gap-1.5 shrink-0">
              <Search className="h-4 w-4" />
              <span>بحث</span>
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            {/* فلتر الحالة */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الحالات</option>
              <option value="scheduled">مجدولة</option>
              <option value="boarding">جاري الصعود</option>
              <option value="in_transit">في الطريق</option>
              <option value="completed">مكتملة</option>
              <option value="cancelled">ملغاة</option>
            </select>

            {/* فلتر المسار */}
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع المسارات</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            {/* زر إضافة رحلة جديدة */}
            <Button onClick={handleOpenAdd} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              <span>إضافة رحلة جديدة</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. جدول الرحلات المجدولة */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm font-medium">
            جاري تحميل جدول الرحلات...
          </div>
        ) : trips.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm font-medium">
            لا توجد رحلات مسجلة مطابقة لمعايير البحث.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رمز الرحلة</TableHead>
                <TableHead>المسار</TableHead>
                <TableHead>الحافلة</TableHead>
                <TableHead>السائق</TableHead>
                <TableHead>موعد المغادرة</TableHead>
                <TableHead>موعد الوصول</TableHead>
                <TableHead>السعر الأساسي</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-center">عدد الحجوزات</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((trip) => (
                <TableRow key={trip.id}>
                  {/* رمز الرحلة */}
                  <TableCell className="font-bold text-slate-900 font-mono">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <span>{trip.trip_code || `TRIP-${trip.id}`}</span>
                    </div>
                  </TableCell>

                  {/* المسار */}
                  <TableCell className="font-semibold text-slate-800 text-xs">
                    <div className="flex items-center gap-1.5">
                      <RouteIcon className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span>{trip.route?.name || trip.route_name || 'مسار غير محدد'}</span>
                    </div>
                  </TableCell>

                  {/* الحافلة */}
                  <TableCell className="font-medium text-slate-700 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Bus className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{trip.bus?.bus_number || trip.bus_number || '—'}</span>
                    </div>
                  </TableCell>

                  {/* السائق */}
                  <TableCell className="font-medium text-slate-700 text-xs">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{trip.driver?.name || trip.driver_name || '—'}</span>
                    </div>
                  </TableCell>

                  {/* موعد المغادرة */}
                  <TableCell className="text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{formatArabicDate(trip.departure_datetime)}</span>
                    </div>
                  </TableCell>

                  {/* موعد الوصول */}
                  <TableCell className="text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{formatArabicDate(trip.arrival_datetime)}</span>
                    </div>
                  </TableCell>

                  {/* السعر الأساسي */}
                  <TableCell className="font-bold text-slate-900 text-xs">
                    {Number(trip.base_fare || 0).toLocaleString('ar-SA')} ر.س
                  </TableCell>

                  {/* الحالة */}
                  <TableCell>{renderStatusBadge(trip.status)}</TableCell>

                  {/* عدد الحجوزات */}
                  <TableCell className="font-bold text-slate-800 text-xs text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {trip.bookings_count ?? (trip.bookings?.length ?? 0)}
                    </span>
                  </TableCell>

                  {/* أزرار الإجراءات */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenEdit(trip)}
                        title="تعديل بيانات الرحلة"
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(trip)}
                        title="حذف الرحلة"
                        className="h-8 w-8 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* 4. نافذة الإضافة والتعديل Dialog */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogContent className="max-w-xl p-0 overflow-hidden" onClose={() => setShowModal(false)}>
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>{editingTrip ? 'تعديل بيانات الرحلة' : 'إضافة رحلة مجدولة جديدة'}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="p-6 pt-2 space-y-4 max-h-[70vh] overflow-y-auto">
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* اختيار المسار عبر كامل العرض */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">المسار *</label>
                <select
                  value={formData.route_id}
                  onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
                  required
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر المسار...</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} {r.distance_km ? `(${r.distance_km} كم)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* الحافلة والسائق */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">الحافلة المخصصة *</label>
                  <select
                    value={formData.bus_id}
                    onChange={(e) => setFormData({ ...formData, bus_id: e.target.value })}
                    required
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر الحافلة...</option>
                    {buses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bus_number} - {b.plate_number} {b.model ? `(${b.model})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">السائق / الكابتن *</label>
                  <select
                    value={formData.driver_id}
                    onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                    required
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر السائق...</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.phone ? `(${d.phone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* مواعيد المغادرة والوصول */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">موعد المغادرة *</label>
                  <Input
                    type="datetime-local"
                    value={formData.departure_datetime}
                    onChange={(e) => setFormData({ ...formData, departure_datetime: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">موعد الوصول التقديري *</label>
                  <Input
                    type="datetime-local"
                    value={formData.arrival_datetime}
                    onChange={(e) => setFormData({ ...formData, arrival_datetime: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* السعر الأساسي والحالة */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">سعر التذكرة الأساسي (ر.س) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="مثال: 120.00"
                    value={formData.base_fare}
                    onChange={(e) => setFormData({ ...formData, base_fare: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">حالة الرحلة</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="scheduled">مجدولة</option>
                    <option value="boarding">جاري الصعود</option>
                    <option value="in_transit">في الطريق</option>
                    <option value="completed">مكتملة</option>
                    <option value="cancelled">ملغاة</option>
                  </select>
                </div>
              </div>

              {/* ملاحظات إضافية */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">ملاحظات إضافية (اختياري)</label>
                <textarea
                  rows={3}
                  placeholder="ملاحظات حول الرحلة، توقفات إضافية، تعليمات خاصة..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="flex w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'جاري الحفظ...' : editingTrip ? 'تحديث الرحلة' : 'جدولة الرحلة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
