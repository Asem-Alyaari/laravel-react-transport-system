import React, { useState, useEffect } from 'react';
import { Bus, Plus, Edit2, Trash2, Search, Wifi, Zap, Coffee, Tv, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';

const AVAILABLE_AMENITIES = [
  { id: 'wifi', label: 'واي فاي مجاني', icon: Wifi },
  { id: 'usb_charger', label: 'شواحن USB', icon: Zap },
  { id: 'toilet', label: 'دورة مياه داخلية', icon: Shield },
  { id: 'screens', label: 'شاشات ترفيه', icon: Tv },
  { id: 'ac', label: 'تكييف مركزي', icon: Shield },
  { id: 'coffee_bar', label: 'ضيافة وقهوة', icon: Coffee },
];

export default function BusManager() {
  const [buses, setBuses] = useState([]);
  const [seatLayouts, setSeatLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // نافذة الإضافة/التعديل
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState({
    bus_number: '',
    plate_number: '',
    seat_layout_id: '',
    model: '',
    manufacture_year: new Date().getFullYear(),
    amenities: ['wifi', 'usb_charger', 'ac'],
    status: 'active',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchBuses = () => {
    setLoading(true);
    api.get('/buses', {
      params: {
        search: searchTerm || undefined,
        status: statusFilter || undefined,
      },
    })
      .then((res) => {
        if (res.data?.status === 'success') {
          setBuses(res.data.data || []);
        }
      })
      .catch((err) => console.error('خطأ في جلب الحافلات:', err))
      .finally(() => setLoading(false));
  };

  const fetchLayouts = () => {
    api.get('/seat-layouts')
      .then((res) => {
        if (res.data?.status === 'success') {
          setSeatLayouts(res.data.data || []);
        }
      })
      .catch((err) => console.error('خطأ في جلب قوالب المقاعد:', err));
  };

  useEffect(() => {
    fetchBuses();
    fetchLayouts();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBuses();
  };

  const handleOpenAdd = () => {
    setEditingBus(null);
    setFormData({
      bus_number: '',
      plate_number: '',
      seat_layout_id: seatLayouts[0]?.id || '',
      model: '',
      manufacture_year: new Date().getFullYear(),
      amenities: ['wifi', 'usb_charger', 'ac'],
      status: 'active',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (bus) => {
    setEditingBus(bus);
    setFormData({
      bus_number: bus.bus_number,
      plate_number: bus.plate_number,
      seat_layout_id: bus.seat_layout_id,
      model: bus.model || '',
      manufacture_year: bus.manufacture_year || new Date().getFullYear(),
      amenities: Array.isArray(bus.amenities) ? bus.amenities : [],
      status: bus.status,
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const toggleAmenity = (id) => {
    if (formData.amenities.includes(id)) {
      setFormData({ ...formData, amenities: formData.amenities.filter((a) => a !== id) });
    } else {
      setFormData({ ...formData, amenities: [...formData.amenities, id] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      if (editingBus) {
        await api.put(`/buses/${editingBus.id}`, formData);
        setSuccessMsg('تم تحديث بيانات الحافلة بنجاح');
      } else {
        await api.post('/buses', formData);
        setSuccessMsg('تمت إضافة الحافلة بنجاح إلى الأسطول');
      }

      setShowModal(false);
      fetchBuses();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (bus) => {
    if (!window.confirm(`هل أنت متأكد من حذف الحافلة "${bus.bus_number}"؟`)) return;

    try {
      await api.delete(`/buses/${bus.id}`);
      setSuccessMsg('تم حذف الحافلة بنجاح من الأسطول');
      fetchBuses();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'تعذر حذف الحافلة');
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">نشطة وفي الخدمة</Badge>;
      case 'maintenance':
        return <Badge variant="warning">تحت الصيانة</Badge>;
      default:
        return <Badge variant="secondary">خارج الخدمة</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* إشعار النجاح */}
      {successMsg && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* شريط الأدوات والبحث */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-md">
            <Input
              type="text"
              placeholder="بحث برقم الحافلة، اللوحة، أو الموديل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10"
            />
            <Button type="submit" variant="secondary" className="gap-1.5 shrink-0">
              <Search className="h-4 w-4" />
              <span>بحث</span>
            </Button>
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الحالات</option>
              <option value="active">نشطة</option>
              <option value="maintenance">صيانة</option>
              <option value="out_of_service">خارج الخدمة</option>
            </select>

            <Button onClick={handleOpenAdd} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              <span>إضافة حافلة جديدة</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* بطاقات أسطول الحافلات */}
      {loading ? (
        <Card>
          <CardContent className="py-16 text-center text-slate-500 text-sm font-medium">
            جاري تحميل بيانات الأسطول...
          </CardContent>
        </Card>
      ) : buses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-slate-500 text-sm font-medium">
            لا توجد حافلات مسجلة في الأسطول مطابقة لمعايير البحث.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {buses.map((b) => (
            <Card key={b.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
                      <Bus className="h-5 w-5 text-blue-600" />
                      <span>{b.bus_number}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">لوحة: {b.plate_number}</span>
                  </div>
                  <div>{renderStatusBadge(b.status)}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="font-bold text-slate-800">
                    {b.model || 'غير محدد الموديل'} ({b.manufacture_year || ''})
                  </div>
                  <div className="text-blue-700 font-medium">
                    قالب المقاعد: {b.seat_layout?.name} ({b.seat_layout?.total_seats} مقعد)
                  </div>
                </div>

                {/* المميزات */}
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(b.amenities) &&
                    b.amenities.map((am) => (
                      <Badge key={am} variant="secondary" className="text-[11px]">
                        {am === 'wifi'
                          ? 'واي فاي'
                          : am === 'usb_charger'
                          ? 'شواحن USB'
                          : am === 'toilet'
                          ? 'حمام'
                          : am === 'screens'
                          ? 'شاشات'
                          : am === 'ac'
                          ? 'تكييف'
                          : am}
                      </Badge>
                    ))}
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  إجمالي الرحلات: <strong className="text-slate-800">{b.trips_count ?? 0}</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenEdit(b)}
                    className="h-8 gap-1 text-blue-600 hover:bg-blue-50 text-xs"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>تعديل</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(b)}
                    className="h-8 gap-1 text-red-600 hover:bg-red-50 text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>حذف</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* نافذة الإضافة والتعديل */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden" onClose={() => setShowModal(false)}>
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Bus className="h-5 w-5 text-blue-600" />
              <span>{editingBus ? 'تعديل بيانات الحافلة' : 'إضافة حافلة جديدة إلى الأسطول'}</span>
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">الرمز الداخلي للحافلة *</label>
                  <Input
                    type="text"
                    placeholder="مثال: BUS-VIP-102"
                    value={formData.bus_number}
                    onChange={(e) => setFormData({ ...formData, bus_number: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">رقم اللوحة المرورية *</label>
                  <Input
                    type="text"
                    placeholder="مثال: أ ب ج 5521"
                    value={formData.plate_number}
                    onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">الموديل / الشركة المصنعة</label>
                  <Input
                    type="text"
                    placeholder="مثال: Mercedes Travego VIP"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">سنة الصنع</label>
                  <Input
                    type="number"
                    min="2000"
                    max={new Date().getFullYear() + 1}
                    value={formData.manufacture_year}
                    onChange={(e) => setFormData({ ...formData, manufacture_year: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">قالب توزيع المقاعد *</label>
                  <select
                    value={formData.seat_layout_id}
                    onChange={(e) => setFormData({ ...formData, seat_layout_id: Number(e.target.value) })}
                    required
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر قالب المقاعد...</option>
                    {seatLayouts.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.total_seats} مقعد - {l.bus_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">الحالة التشغيلية</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">نشطة في الخدمة</option>
                    <option value="maintenance">تحت الصيانة الدورية</option>
                    <option value="out_of_service">خارج الخدمة</option>
                  </select>
                </div>
              </div>

              {/* المميزات والخدمات */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-700 block">المميزات المتوفرة في الحافلة:</label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_AMENITIES.map((am) => {
                    const isChecked = formData.amenities.includes(am.id);
                    return (
                      <label
                        key={am.id}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-blue-50 border-blue-200 text-blue-900'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAmenity(am.id)}
                          className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>{am.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'جاري الحفظ...' : editingBus ? 'تحديث البيانات' : 'إضافة الحافلة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
