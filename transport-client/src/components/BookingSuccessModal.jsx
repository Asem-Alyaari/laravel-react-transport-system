import React from 'react';
import { CheckCircle, Printer, QrCode, Bus, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export default function BookingSuccessModal({ booking, onClose, onNewBooking }) {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden" onClose={onClose}>
        {/* رأس النافذة */}
        <div className="bg-emerald-50/80 border-b border-emerald-100 p-6 flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold text-emerald-950">
              تم تأكيد الحجز وإصدار التذاكر!
            </DialogTitle>
            <DialogDescription className="text-emerald-700 text-sm mt-1">
              احتفظ برقم الحجز أو كود الـ QR لإبرازه عند ركوب الحافلة
            </DialogDescription>
          </div>
        </div>

        {/* محتوى التذكرة الإلكترونية */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[65vh]">
          {/* شريط PNR وحالة الدفع */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">رقم مرجع الحجز (PNR)</span>
              <span className="text-xl font-black text-blue-700 tracking-wider font-mono">
                {booking.booking_reference}
              </span>
            </div>
            <div className="text-left">
              <span className="text-xs font-semibold text-slate-500 block mb-1">حالة الدفع</span>
              <Badge variant="success">مؤكد ومدفوع</Badge>
            </div>
          </div>

          {/* تفاصيل مسار الرحلة والمسافر */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-base">
              <Bus className="h-5 w-5 text-blue-600" />
              <span>{booking.route_name || 'رحلة مجدولة بين المدن'}</span>
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <div>
                رمز الرحلة: <strong className="text-slate-800">{booking.trip_code}</strong>
              </div>
              <div>
                المسافر الأساسي: <strong className="text-slate-800">{booking.customer_name}</strong> ({booking.customer_phone})
              </div>
            </div>
          </div>

          {/* قائمة التذاكر والمقاعد */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3">
              التذاكر والمقاعد الصادرة ({booking.tickets?.length || 0}):
            </h4>
            <div className="space-y-2">
              {booking.tickets?.map((t) => (
                <div
                  key={t.ticket_number}
                  className="flex items-center justify-between p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-extrabold text-xs shadow-xs">
                      مقعد {t.seat_number}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{t.passenger_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">تذكرة: {t.ticket_number}</div>
                    </div>
                  </div>
                  <div className="text-left font-black text-slate-900 text-sm">
                    {t.fare} ر.س
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* باركود الصعود QR Code */}
          <div className="flex flex-col items-center justify-center py-4 px-2 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-center">
            <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200 mb-2">
              <QrCode className="h-16 w-16 text-slate-800" />
            </div>
            <span className="text-xs text-slate-600 font-medium">
              امسح هذا الرمز عند باب الحافلة لتأكيد الصعود (Boarding Pass)
            </span>
          </div>

          {/* إجمالي المبلغ المدفوع */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 font-bold">
            <span className="text-slate-700">المبلغ الإجمالي المدفوع (شامل الضريبة):</span>
            <span className="text-xl font-black text-emerald-600">
              {booking.total_amount} ر.س
            </span>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4 text-slate-600" />
            <span>طباعة التذكرة</span>
          </Button>

          <Button onClick={onNewBooking} className="gap-2">
            <span>حجز رحلة أخرى</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
