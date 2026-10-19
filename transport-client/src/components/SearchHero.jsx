import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, ArrowLeftRight, Search, Navigation } from 'lucide-react';
import api from '../api/axios';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export default function SearchHero({ onSearch, loading }) {
  const [stations, setStations] = useState([]);
  const [originId, setOriginId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    api.get('/stations')
      .then((res) => {
        if (res.data?.status === 'success') {
          const list = res.data.data;
          setStations(list);
          if (list.length >= 2) {
            const ruh = list.find((s) => s.code === 'RUH') || list[0];
            const med = list.find((s) => s.code === 'MED') || list[1];
            setOriginId(ruh.id);
            setDestinationId(med.id);
          }
        }
      })
      .catch((err) => console.error('فشل جلب المحطات:', err));
  }, []);

  const handleSwap = () => {
    const temp = originId;
    setOriginId(destinationId);
    setDestinationId(temp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!originId || !destinationId) return;
    onSearch({ originId, destinationId, date: travelDate });
  };

  return (
    <Card className="p-6 md:p-8 shadow-xs border-slate-200/90 mb-8 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <Navigation className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">
            احجز رحلتك القادمة بأعلى معايير الراحة
          </h2>
        </div>
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 font-bold w-fit">
          رحلات يومية منتظمة ومباشرة
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
        {/* Origin Station */}
        <div className="md:col-span-4 space-y-1.5">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>محطة المغادرة</span>
          </label>
          <select
            value={originId}
            onChange={(e) => setOriginId(Number(e.target.value))}
            required
            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
          >
            <option value="">اختر محطة المغادرة...</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id} disabled={s.id === destinationId}>
                {s.city} - {s.name_ar} ({s.code})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex justify-center pb-0.5">
          <button
            type="button"
            onClick={handleSwap}
            title="تبديل محطة الانطلاق والوصول"
            className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-blue-600 flex items-center justify-center transition-all cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Destination Station */}
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>محطة الوصول</span>
          </label>
          <select
            value={destinationId}
            onChange={(e) => setDestinationId(Number(e.target.value))}
            required
            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
          >
            <option value="">اختر محطة الوصول...</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id} disabled={s.id === originId}>
                {s.city} - {s.name_ar} ({s.code})
              </option>
            ))}
          </select>
        </div>

        {/* Travel Date */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>تاريخ السفر</span>
          </label>
          <input
            type="date"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
          />
        </div>

        {/* Search Submit Button */}
        <div className="md:col-span-2">
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold shadow-md shadow-blue-600/20"
          >
            <Search className="w-4 h-4 ml-1" />
            <span>{loading ? 'بحث...' : 'بحث الرحلات'}</span>
          </Button>
        </div>
      </form>
    </Card>
  );
}
