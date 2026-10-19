import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Edit2, Trash2, Search, Phone, CreditCard, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';

export default function DriverManager() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // نافذة الإضافة/التعديل
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    license_number: '',
    license_expiry: '',
    status: 'available',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDrivers = () => {
    setLoading(true);
    api.get('/drivers', {
      params: {
        search: searchTerm || undefined,
        status: statusFilter || undefined,
      },
    })
      .then((res) => {
        if (res.data?.status === 'success') {
          setDrivers(res.data.data || []);
        }
      })
      .catch((err) => console.error('خطأ في جلب السائقين:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDrivers();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDrivers();
  };

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setFormData({
      name: '',
      phone: '',
      license_number: '',
      license_expiry: '',
      status: 'available',
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      license_number: driver.license_number,
      license_expiry: driver.license_expiry || '',
      status: driver.status,
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      if (editingDriver) {
        await api.put(`/drivers/${editingDriver.id}`, formData);
        setSuccessMsg('تم تحديث بيانات السائق بنجاح');
      } else {
        await api.post('/drivers', formData);
        setSuccessMsg('تمت إضافة السائق الجديد بنجاح');
      }

      setShowModal(false);
      fetchDrivers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (driver) => {
    if (!window.confirm(`هل أنت متأكد من حذف السائق "${driver.name}"؟`)) return;

    try {
      await api.delete(`/drivers/${driver.id}`);
      setSuccessMsg('تم حذف السائق بنجاح');
      fetchDrivers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'تعذر حذف السائق');
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge variant="success">متاح</Badge>;
      case 'on_trip':
        return <Badge variant="default">في رحلة</Badge>;
      case 'on_leave':
        return <Badge variant="warning">في إجازة</Badge>;
      default:
        return <Badge variant="secondary">غير نشط</Badge>;
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
              placeholder="بحث بالاسم، الجوال، أو رقم الرخصة..."
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
              <option value="available">متاح</option>
              <option value="on_trip">في رحلة</option>
              <option value="on_leave">في إجازة</option>
              <option value="inactive">غير نشط</option>
            </select>

            <Button onClick={handleOpenAdd} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              <span>إضافة كابتن / سائق جديد</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* جدول السائقين */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm font-medium">
            جاري تحميل بيانات السائقين...
          </div>
        ) : drivers.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm font-medium">
            لا يوجد سائقين مسجلين مطابقين لمعايير البحث.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم السائق</TableHead>
                <TableHead>رقم الجوال</TableHead>
                <TableHead>رخصة القيادة</TableHead>
                <TableHead>تاريخ انتهاء الرخصة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الرحلات المنجزة</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <span>{d.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{d.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-slate-700">
                    {d.license_number}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {d.license_expiry || 'غير محدد'}
                  </TableCell>
                  <TableCell>{renderStatusBadge(d.status)}</TableCell>
                  <TableCell className="font-bold text-slate-800 text-xs">
                    {d.trips_count ?? 0} رحلة
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenEdit(d)}
                        title="تعديل بيانات السائق"
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(d)}
                        title="حذف السائق"
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
        <DialogContent className="max-w-md p-0 overflow-hidden" onClose={() => setShowModal(false)}>
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <span>{editingDriver ? 'تعديل بيانات السائق' : 'إضافة كابتن / سائق جديد'}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="p-6 pt-2 space-y-4">
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">اسم السائق الكامل *</label>
                <Input
                  type="text"
                  placeholder="مثال: عبدالله الشمري"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">رقم الجوال *</label>
                  <Input
                    type="tel"
                    placeholder="050xxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">رقم رخصة القيادة *</label>
                  <Input
                    type="text"
                    placeholder="DL-908123"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">تاريخ انتهاء الرخصة</label>
                  <Input
                    type="date"
                    value={formData.license_expiry}
                    onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">الحالة التشغيلية</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="available">متاح للرحلات</option>
                    <option value="on_trip">في رحلة حالياً</option>
                    <option value="on_leave">في إجازة</option>
                    <option value="inactive">غير نشط / موقوف</option>
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'جاري الحفظ...' : editingDriver ? 'تحديث البيانات' : 'إضافة السائق'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
