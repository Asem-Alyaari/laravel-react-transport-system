import React, { useState } from 'react';
import { Bus, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react';
import DriverManager from './DriverManager';
import BusManager from './BusManager';

export default function AdminDashboard({ onBackToBooking }) {
  const [activeTab, setActiveTab] = useState('buses'); // 'buses' | 'drivers'

  return (
    <div className="main-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
      {/* رأس لوحة العمليات */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={26} color="#2563eb" />
            <span>لوحة إدارة العمليات: السائقين والأسطول</span>
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            إدارة أسطول الحافلات، الكباتن والسائقين، وتراخيص التشغيل
          </span>
        </div>

        <button
          type="button"
          onClick={onBackToBooking}
          style={{
            background: 'white',
            border: '1.5px solid #cbd5e1',
            padding: '10px 18px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#1e3a8a',
          }}
        >
          <ArrowRight size={18} />
          <span>العودة إلى بوابة الحجز</span>
        </button>
      </div>

      {/* شريط التبويبات (Tabs) */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('buses')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'buses' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'buses' ? '#2563eb' : '#64748b',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '-2px',
          }}
        >
          <Bus size={20} />
          <span>أسطول الحافلات (Buses)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('drivers')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'drivers' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'drivers' ? '#2563eb' : '#64748b',
            fontWeight: 800,
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '-2px',
          }}
        >
          <UserCheck size={20} />
          <span>الكباتن والسائقين (Drivers)</span>
        </button>
      </div>

      {/* محتوى التبويب النشط */}
      <div>
        {activeTab === 'buses' && <BusManager />}
        {activeTab === 'drivers' && <DriverManager />}
      </div>
    </div>
  );
}
