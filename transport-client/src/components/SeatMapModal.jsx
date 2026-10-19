import React, { useState, useEffect } from 'react';
import { Check, ArrowLeft, CircleDot, DoorOpen, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export default function SeatMapModal({ trip, onClose, onProceedToPassengers }) {
  const [loading, setLoading] = useState(true);
  const [seatData, setSeatData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!trip) return;
    setLoading(true);
    setErrorMsg('');

    api.get(`/trips/${trip.id}/seat-map`, {
      params: {
        from_station_id: trip.origin_station_id,
        to_station_id: trip.destination_station_id,
      },
    })
      .then((res) => {
        if (res.data?.status === 'success') {
          setSeatData(res.data.data);
        } else {
          setErrorMsg(res.data?.message || 'تعذر تحميل خريطة المقاعد');
        }
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.message || 'خطأ في الاتصال بالخادم');
      })
      .finally(() => setLoading(false));
  }, [trip]);

  const toggleSeat = (seat) => {
    if (seat.status !== 'available') return;

    if (selectedSeats.includes(seat.seat_number)) {
      setSelectedSeats(selectedSeats.filter((num) => num !== seat.seat_number));
    } else {
      if (selectedSeats.length >= 5) {
        alert('الحد الأقصى للحجز هو 5 مقاعد في المرة الواحدة.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat.seat_number]);
    }
  };

  const farePerSeat = seatData?.segment_fare || trip.fare;
  const subtotal = selectedSeats.length * farePerSeat;
  const tax = Number((subtotal * 0.15).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  const rowsGrouped = {};
  if (seatData?.seats) {
    seatData.seats.forEach((s) => {
      if (!rowsGrouped[s.row]) rowsGrouped[s.row] = [];
      rowsGrouped[s.row].push(s);
    });
  }

  return (
    <Dialog open={Boolean(trip)} onClose={onClose}>
      <DialogContent onClose={onClose} className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">
                خريطة مقاعد الحافلة: {trip.bus?.model || trip.bus?.bus_number}
              </DialogTitle>
              <p className="text-xs text-slate-500 font-medium mt-1">
                الرحلة: <strong className="text-slate-700">{trip.trip_code}</strong> | {trip.route_name}
              </p>
            </div>
            <Badge variant="vip" className="ml-8">
              {trip.bus?.bus_type === 'vip' ? 'VIP رويال (2+1)' : 'حافلة قياسية'}
            </Badge>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] py-4 px-2">
          {loading && (
            <div className="text-center py-12 text-slate-500 text-sm font-semibold">
              جاري تجهيز وتحديث خريطة المقاعد اللحظية...
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!loading && seatData && (
            <div className="space-y-6">
              {/* هيكل الحافلة البصري */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-[36px] p-6 max-w-sm mx-auto shadow-inner">
                {/* مقصورة السائق والباب */}
                <div className="flex items-center justify-between border-b-2 border-dashed border-slate-200 pb-3 mb-5">
                  <div className="flex items-center gap-1.5 text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-lg">
                    <DoorOpen className="w-3.5 h-3.5" />
                    <span>باب الصعود</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <CircleDot className="w-4 h-4 text-slate-400" />
                    <span>مقصورة السائق</span>
                  </div>
                </div>

                {/* شبكة المقاعد */}
                <div className="space-y-2.5">
                  {Object.keys(rowsGrouped).map((rowNum) => {
                    const rowSeats = rowsGrouped[rowNum];
                    const leftWindow = rowSeats.find((s) => s.col === 1);
                    const leftAisle = rowSeats.find((s) => s.col === 2);
                    const rightSingle = rowSeats.find((s) => s.col === 4);

                    return (
                      <div key={rowNum} className="grid grid-cols-4 gap-2 items-center">
                        {/* مقعد نافذة يسار */}
                        {leftWindow ? (
                          <button
                            type="button"
                            onClick={() => toggleSeat(leftWindow)}
                            className={`h-11 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer border-2 ${
                              selectedSeats.includes(leftWindow.seat_number)
                                ? 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-500/30 scale-105'
                                : leftWindow.status === 'available'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 hover:scale-105'
                                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                            }`}
                          >
                            <span>{leftWindow.seat_number}</span>
                            {selectedSeats.includes(leftWindow.seat_number) && <Check className="w-3 h-3 mr-0.5" />}
                          </button>
                        ) : <div />}

                        {/* مقعد ممر يسار */}
                        {leftAisle ? (
                          <button
                            type="button"
                            onClick={() => toggleSeat(leftAisle)}
                            className={`h-11 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer border-2 ${
                              selectedSeats.includes(leftAisle.seat_number)
                                ? 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-500/30 scale-105'
                                : leftAisle.status === 'available'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 hover:scale-105'
                                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                            }`}
                          >
                            <span>{leftAisle.seat_number}</span>
                            {selectedSeats.includes(leftAisle.seat_number) && <Check className="w-3 h-3 mr-0.5" />}
                          </button>
                        ) : <div />}

                        {/* ممر وسطي */}
                        <div className="text-center text-xs font-bold text-slate-300">|</div>

                        {/* مقعد مفرد يمين */}
                        {rightSingle ? (
                          <button
                            type="button"
                            onClick={() => toggleSeat(rightSingle)}
                            className={`h-11 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer border-2 ${
                              selectedSeats.includes(rightSingle.seat_number)
                                ? 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-500/30 scale-105'
                                : rightSingle.status === 'available'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 hover:scale-105'
                                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                            }`}
                          >
                            <span>{rightSingle.seat_number}</span>
                            {selectedSeats.includes(rightSingle.seat_number) && <Check className="w-3 h-3 mr-0.5" />}
                          </button>
                        ) : <div />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* دليل الرموز والألوان */}
              <div className="flex items-center justify-center gap-6 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-emerald-50 border-2 border-emerald-400" />
                  <span className="text-slate-600">متاح ({farePerSeat} ر.س)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-blue-600 border-2 border-blue-700" />
                  <span className="text-slate-600">محدد</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-slate-100 border-2 border-slate-300" />
                  <span className="text-slate-400">محجوز</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="bg-slate-50/70 p-4 -mx-6 -mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-right w-full sm:w-auto">
            <div className="text-xs text-slate-500 font-medium">
              المقاعد المختارة: <strong className="text-slate-800">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'لا يوجد'}</strong>
            </div>
            <div className="text-base font-black text-blue-900 mt-0.5">
              الإجمالي: {total} ر.س <span className="text-[10px] text-slate-500 font-normal">(شامل 15% ضريبة)</span>
            </div>
          </div>

          <Button
            size="lg"
            disabled={selectedSeats.length === 0}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-bold px-6"
            onClick={() => onProceedToPassengers({ trip, selectedSeats, farePerSeat, subtotal, tax, total })}
          >
            <span>متابعة بيانات الركاب ({selectedSeats.length})</span>
            <ArrowLeft className="w-4 h-4 ml-1" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
