import React, { useState } from 'react';
import { User, Phone, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

export default function PassengerModal({ bookingDraft, onClose, onBookingSuccess }) {
  const { trip, selectedSeats, total, subtotal, tax } = bookingDraft;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const [passengers, setPassengers] = useState(() =>
    selectedSeats.map((seatNum) => ({
      seat_number: seatNum,
      name: '',
      national_id: '',
      gender: 'male',
      passenger_type: 'adult',
    }))
  );

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const payload = {
        trip_id: trip.id,
        from_station_id: trip.origin_station_id,
        to_station_id: trip.destination_station_id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        payment_method: paymentMethod,
        passengers: passengers.map((p) => ({
          name: p.name || customerName,
          national_id: p.national_id || null,
          gender: p.gender,
          passenger_type: p.passenger_type,
          seat_number: p.seat_number,
        })),
      };

      const res = await api.post('/bookings', payload);

      if (res.data?.status === 'success') {
        onBookingSuccess(res.data.data);
      } else {
        setErrorMsg(res.data?.message || 'تعذر إتمام الحجز');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={Boolean(bookingDraft)} onClose={onClose}>
      <DialogContent onClose={onClose} className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <DialogTitle>بيانات المسافرين وإتمام الحجز</DialogTitle>
            </div>
            <Badge variant="secondary" className="font-bold ml-8">
              المقاعد ({selectedSeats.length}): {selectedSeats.join(', ')}
            </Badge>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="overflow-y-auto max-h-[60vh] py-4 space-y-5 px-1">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* بيانات التواصل الرئيسية */}
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 border-b border-blue-200/50 pb-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>بيانات التواصل (المسافر الأساسي)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">الاسم الكامل *</label>
                  <Input
                    placeholder="مثال: محمد عبدالله الشمري"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">رقم الجوال *</label>
                  <Input
                    type="tel"
                    placeholder="050xxxxxxx"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">البريد الإلكتروني (اختياري)</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
            </div>

            {/* تفاصيل الركاب لكل مقعد */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900">بيانات الركاب حسب المقاعد:</h4>

              {passengers.map((p, idx) => (
                <div key={p.seat_number} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs font-black">
                      مقعد {p.seat_number}
                    </Badge>
                    <span className="text-xs font-bold text-slate-700">الراكب #{idx + 1}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">اسم الراكب *</label>
                      <Input
                        placeholder="الاسم كما في الهوية"
                        value={p.name}
                        onChange={(e) => updatePassenger(idx, 'name', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">رقم الهوية / الإقامة</label>
                      <Input
                        placeholder="10xxxxxxxx"
                        value={p.national_id}
                        onChange={(e) => updatePassenger(idx, 'national_id', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">الجنس</label>
                      <select
                        value={p.gender}
                        onChange={(e) => updatePassenger(idx, 'gender', e.target.value)}
                        className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium"
                      >
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">الفئة العمرية</label>
                      <select
                        value={p.passenger_type}
                        onChange={(e) => updatePassenger(idx, 'passenger_type', e.target.value)}
                        className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium"
                      >
                        <option value="adult">بالغ (كامل)</option>
                        <option value="child">طفل (2-12 سنة)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* طريقة الدفع */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>طريقة الدفع:</span>
              </label>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="pay"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>نقداً عند شباك المحطة</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="pay"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>بطاقة مدى / ائتمانية</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-slate-50/70 p-4 -mx-6 -mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-right w-full sm:w-auto">
              <div className="text-xs text-slate-500 font-medium">
                الأساسي: {subtotal} ر.س | الضريبة: {tax} ر.س
              </div>
              <div className="text-base font-black text-emerald-600 mt-0.5">
                الإجمالي: {total} ر.س
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 font-bold px-8 shadow-md shadow-emerald-600/20"
            >
              <ShieldCheck className="w-4 h-4 ml-1" />
              <span>{loading ? 'جاري التأكيد...' : 'تأكيد الحجز الآن'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
