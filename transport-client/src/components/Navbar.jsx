import React from 'react';
import { Bus, Search, ShieldCheck } from 'lucide-react';

export default function Navbar({ onOpenTrack, onOpenAdmin }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand-logo">
          <div className="brand-icon">
            <Bus size={26} />
          </div>
          <div className="brand-text">
            <h1>سفريات النخبة</h1>
            <span>Elite Smart Transit & Ticketing</span>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-secondary-nav" onClick={onOpenAdmin}>
            <Bus size={16} />
            <span>إدارة الأسطول والسائقين</span>
          </button>
          <button className="btn-secondary-nav" onClick={onOpenTrack}>
            <Search size={16} />
            <span>الاستعلام عن تذكرة (PNR)</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#86efac' }}>
            <ShieldCheck size={16} />
            <span>النظام متصل</span>
          </div>
        </div>
      </div>
    </header>
  );
}
