import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Search,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
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

export default function StationManager() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // نافذة الإضافة/التعديل
  const [showModal, setShowModal] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    code: '',
    city: '',
    address: '',
    phone: '',
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // جلب المحطات من الـ API
  const fetchStations = () => {
    setLoading(true);
    api
      .get('/stations', {
        params: {
          search: searchTerm || undefined,
          is_active: statusFilter === '' ? undefined : statusFilter === 'active',
        },
      })
      .then((res) => {
        if (res.data?.status === 'success') {
          setStations(res.data.data || []);
        }
      })
      .catch((err) => {
        console.error('خطأ في جلب بيانات المحطات:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStations();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStations();
  };

  const handleOpenAdd = () => {
    setEditingStation(null);
    setFormData({
      name_ar: '',
      name_en: '',
      code: '',
      city: '',
      address: '',
      phone: '',
      is_active: true,
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (station) => {
    setEditingStation(station);
    setFormData({
      name_ar: station.name_ar || '',
      name_en: station.name_en || '',
      code: station.code || '',
      city: station.city || '',
      address: station.address || '',
      phone: station.phone || '',
      is_active: Boolean(station.is_active),
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    const payload = {
      ...formData,
      code: formData.code.toUpperCase().trim(),
    };

    try {
      if (editingStation) {
        await api.put(`/stations/${editingStation.id}`, payload);
        setSuccessMsg('تم تحديث بيانات المحطة بنجاح');
      } else {
        await api.post('/stations', payload);
        setSuccessMsg('تمت إضافة المحطة الجديدة بنجاح');
      }

      setShowModal(false);
      fetchStations();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'حدث خطأ أثناء حفظ بيانات المحطة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (station) => {
    if (!window.confirm(`هل أنت متأكد من حذف محطة "${station.name_ar}"؟`)) return;

    try {
      await api.delete(`/stations/${station.id}`);
      setSuccessMsg('تم حذف المحطة بنجاح');
      fetchStations();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'تعذر حذف المحطة');
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

      {/* شريط الإجراءات والبحث */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-md">
            <Input
              type="text"
              placeholder="بحث باسم المحطة، المدينة، أو الرمز..."
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
              <option value="">جميع المحطات</option>
              <option value="active">محطات نشطة</option>
              <option value="inactive">محطات معطلة</option>
            </select>

            <Button onClick={handleOpenAdd} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              <span>إضافة محطة جديدة</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* جدول المحطات */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm font-medium flex flex-col items-center justify-center gap-3">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span>جاري تحميل بيانات المحطات...</span>
          </div>
        ) : stations.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm font-medium">
            لا توجد محطات مسجلة تطابق معايير البحث.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رمز المحطة</TableHead>
                <TableHead>اسم المحطة بالعربية</TableHead>
                <TableHead>الاسم بالإنجليزية</TableHead>
                <TableHead>المدينة</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stations.map((station) => (
                <TableRow key={station.id}>
                  {/* رمز المحطة */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-mono font-bold tracking-wider text-xs px-2.5 py-0.5 bg-slate-100 text-slate-800 border-slate-300"
                    >
                      {station.code}
                    </Badge>
                  </TableCell>

                  {/* اسم المحطة بالعربية */}
                  <TableCell className="font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <span>{station.name_ar}</span>
                    </div>
                  </TableCell>

                  {/* الاسم بالإنجليزية */}
                  <TableCell className="font-medium text-slate-600 text-xs">
                    {station.name_en || '—'}
                  </TableCell>

                  {/* المدينة */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-slate-700 text-xs font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span>{station.city}</span>
                    </div>
                  </TableCell>

                  {/* العنوان */}
                  <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                    {station.address || '—'}
                  </TableCell>

                  {/* الهاتف */}
                  <TableCell className="font-mono text-xs text-slate-600">
                    {station.phone ? (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{station.phone}</span>
                      </div>
                    ) : (
                      '—'
                    )}
                  </TableCell>

                  {/* الحالة */}
                  <TableCell>
                    <Badge variant={station.is_active ? 'success' : 'destructive'}>
                      {station.is_active ? 'نشطة' : 'معطلة'}
                    </Badge>
                  </TableCell>

                  {/* الإجراءات */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenEdit(station)}
                        title="تعديل بيانات المحطة"
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(station)}
                        title="حذف المحطة"
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

      {/* نافذة الإضافة والتعديل Dialog */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogContent className="max-w-xl p-0 overflow-hidden" onClose={() => setShowModal(false)}>
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span>{editingStation ? 'تعديل بيانات المحطة' : 'إضافة محطة ركاب جديدة'}</span>
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

              {/* أسماء المحطة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">اسم المحطة بالعربية *</label>
                  <Input
                    type="text"
                    placeholder="مثال: محطة الرياض المركزية"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">الاسم بالإنجليزية *</label>
                  <Input
                    type="text"
                    placeholder="e.g. Riyadh Central Station"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* الرمز والمدينة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">رمز المحطة (Code) *</label>
                  <Input
                    type="text"
                    placeholder="مثال: RUH أو JED"
                    value={formData.code}
                    maxLength={10}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="font-mono uppercase font-bold"
                    required
                  />
                  <span className="text-[10px] text-slate-400">رمز فريد للمحطة من 3 إلى 5 أحرف إنجليزية</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">المدينة *</label>
                  <Input
                    type="text"
                    placeholder="مثال: الرياض"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* الهاتف والعنوان */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">رقم الهاتف / الاستعلامات</label>
                  <Input
                    type="tel"
                    placeholder="مثال: 0114050000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">العنوان والموقع</label>
                  <Input
                    type="text"
                    placeholder="مثال: طريق الدائري الجنوبي، حي العزيزية"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              {/* الحالة التشغيلية */}
              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer select-none transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">محطة نشطة ومتاحة للتشغيل</span>
                    <span className="text-[11px] text-slate-500 block">
                      عند التفعيل، يمكن تعيين المحطة في المسارات وجدولة الرحلات واستقبال الركاب.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'جاري الحفظ...' : editingStation ? 'تحديث بيانات المحطة' : 'إضافة المحطة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
