import React, { useState } from 'react';
import { Search, Bus, CheckCircle2, AlertCircle, Ticket, QrCode } from 'lucide-react';
import api from '../api/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

export default function TrackBookingModal({ onClose, inline = false }) {
  const [pnr, setPnr] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pnr.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setBooking(null);

    try {
      const res = await api.get(`/bookings/${pnr.trim().toUpperCase()}`);
      if (res.data?.status === 'success') {
        setBooking(res.data.data);
      } else {
        setErrorMsg(res.data?.message || 'رقم الحجز غير موجود');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'رقم الحجز غير موجود أو حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const bodyContent = (
    <div className="space-y-6">
      {inline && (
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                الاستعلام عن التذاكر والحجوزات (PNR)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                أدخل رقم المرجع المطبوع على التذكرة الإلكترونية للاطلاع على تفاصيل الرحلة وحالة الصعود
              </p>
            </div>
          </div>
        </div>
      )}

      {/* نموذج البحث */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="أدخل رمز الحجز (مثال: PNR-ABC123)..."
            value={pnr}
            onChange={(e) => setPnr(e.target.value)}
            required
            className="uppercase font-mono text-base tracking-wider h-12"
          />
        </div>
        <Button type="submit" disabled={loading} size="lg" className="shrink-0 px-6 gap-2">
          <Search className="h-4 w-4" />
          <span>{loading ? 'جاري البحث...' : 'استعلام'}</span>
        </Button>
      </form>

      {/* رسالة الخطأ */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* بطاقة تفاصيل الحجز بعد البحث */}
      {booking && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">رقم المرجع (PNR)</span>
              <span className="text-xl font-black text-blue-700 font-mono tracking-wider">
                {booking.booking_reference}
              </span>
            </div>
            <div>
              <Badge variant={booking.booking_status === 'confirmed' ? 'success' : 'secondary'}>
                {booking.booking_status === 'confirmed' ? 'مؤكد ومدفوع' : booking.booking_status}
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Bus className="h-5 w-5 text-blue-600" />
              <span>{booking.trip?.route?.name || 'رحلة مجدولة بين المدن'}</span>
            </div>
            <p className="text-xs text-slate-600">
              المسافر الأساسي: <strong className="text-slate-900">{booking.customer_name}</strong> | رقم الهاتف: <strong className="text-slate-900 font-mono">{booking.customer_phone}</strong>
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              قائمة التذاكر المسجلة ({booking.tickets?.length || 0}):
            </h4>
            <div className="space-y-2">
              {booking.tickets?.map((t) => (
                <div
                  key={t.ticket_number}
                  className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-extrabold text-xs shadow-xs">
                      مقعد {t.seat_number}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{t.passenger_name || 'مسافر'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">تذكرة: {t.ticket_number}</div>
                    </div>
                  </div>

                  <div className="text-left">
                    <Badge variant={t.status === 'valid' ? 'success' : 'warning'}>
                      {t.status === 'valid' ? 'جاهز للصعود' : t.status === 'boarded' ? 'تم الصعود' : t.status}
                    </Badge>
                    <div className="font-black text-slate-900 text-sm mt-1">{t.fare} ر.س</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 font-bold">
            <span className="text-slate-700 text-sm">الإجمالي المدفوع:</span>
            <span className="text-xl font-black text-emerald-600">{booking.total_amount} ر.س</span>
          </div>
        </div>
      )}
    </div>
  );

  if (inline) {
    return (
      <Card className="max-w-3xl mx-auto shadow-sm">
        <CardContent className="p-8">{bodyContent}</CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogContent className="max-w-xl" onClose={onClose}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <Search className="h-5 w-5 text-blue-600" />
            <span>الاستعلام عن تذكرة برقم المرجع (PNR)</span>
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">{bodyContent}</div>
      </DialogContent>
    </Dialog>
  );
}
