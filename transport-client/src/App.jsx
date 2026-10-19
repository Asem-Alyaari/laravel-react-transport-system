import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
import LoadingScreen from './components/LoadingScreen';
import Sidebar from './components/Sidebar';
import HeaderBar from './components/HeaderBar';
import HomeDashboard from './components/HomeDashboard';
import SearchHero from './components/SearchHero';
import TripCard from './components/TripCard';
import SeatMapModal from './components/SeatMapModal';
import PassengerModal from './components/PassengerModal';
import BookingSuccessModal from './components/BookingSuccessModal';
import TrackBookingModal from './components/TrackBookingModal';
import TripManager from './components/admin/TripManager';
import BusManager from './components/admin/BusManager';
import DriverManager from './components/admin/DriverManager';
import RouteManager from './components/admin/RouteManager';
import StationManager from './components/admin/StationManager';
import ReportsManager from './components/admin/ReportsManager';
import api from './api/axios';
import { Bus } from 'lucide-react';
import { Card, CardContent } from './components/ui/card';

function AppContent() {
  const { user, loading, logout } = useAuth();

  // الحالة الحالية للواجهة النشطة في القائمة الجانبية
  const [activeView, setActiveView] = useState('home'); // 'home' | 'booking' | 'trips' | 'routes' | 'stations' | 'buses' | 'drivers' | 'tracking'

  // حالات البحث عن الرحلات
  const [trips, setTrips] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useState(null);

  // نوافذ الحوار (Modals)
  const [selectedTripForSeats, setSelectedTripForSeats] = useState(null);
  const [bookingDraft, setBookingDraft] = useState(null);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  const role = user?.role || 'admin';

  // التحقق من الصلاحيات وضمان عدم بقاء المستخدم في صفحات غير مسموحة لدوره
  useEffect(() => {
    if (role === 'passenger' && !['home', 'booking', 'tracking'].includes(activeView)) {
      setActiveView('home');
    } else if (role === 'agent' && ['routes', 'stations'].includes(activeView)) {
      setActiveView('home');
    }
  }, [role, activeView]);

  // دالة البحث عن الرحلات
  const handleSearch = async ({ originId, destinationId, date }) => {
    setSearchLoading(true);
    setHasSearched(true);
    setSearchParams({ originId, destinationId, date });

    try {
      const res = await api.get('/trips/search', {
        params: {
          origin_id: originId,
          destination_id: destinationId,
          date: date,
        },
      });

      if (res.data?.status === 'success') {
        setTrips(res.data.data || []);
      }
    } catch (err) {
      console.error('خطأ في البحث عن الرحلات:', err);
      setTrips([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // فتح نافذة اختيار المقاعد
  const handleSelectSeats = (trip) => {
    setSelectedTripForSeats({
      ...trip,
      origin_station_id: trip.origin_station_id || searchParams?.originId || 1,
      destination_station_id: trip.destination_station_id || searchParams?.destinationId || 4,
    });
  };

  // الانتقال من المقاعد إلى إدخال بيانات الركاب
  const handleProceedToPassengers = (draft) => {
    setSelectedTripForSeats(null);
    setBookingDraft(draft);
  };

  // نجاح الحجز وإصدار التذاكر
  const handleBookingSuccess = (confirmedBooking) => {
    setBookingDraft(null);
    setBookingSuccessData(confirmedBooking);
    if (searchParams) {
      handleSearch(searchParams);
    }
  };

  // شاشة التحقق من الجلسة والتوثيق عند بدء التشغيل
  if (loading) {
    return <LoadingScreen />;
  }

  // إذا لم يكن المستخدم مسجلاً للدخول، يتم عرض صفحة الدخول
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50/60 font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 1. القائمة الجانبية الموحدة (Sidebar) */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        user={user}
        onLogout={logout}
      />

      {/* 2. مساحة العمل الرئيسية */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* الشريط العلوي */}
        <HeaderBar activeView={activeView} user={user} />

        {/* جسم الصفحة والمحتوى المعروض */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 print:p-0 print:m-0 print:max-w-none">
          {/* الصفحة الرئيسية (Dashboard) */}
          {activeView === 'home' && (
            <HomeDashboard
              onNavigate={setActiveView}
              onSelectTripForBooking={handleSelectSeats}
            />
          )}

          {/* بوابة حجز وتذاكر الرحلات */}
          {activeView === 'booking' && (
            <div className="space-y-6">
              <SearchHero onSearch={handleSearch} loading={searchLoading} />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>الرحلات المجدولة المتاحة</span>
                    {trips.length > 0 && (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-200/60 px-2.5 py-0.5 rounded-full">
                        {trips.length} رحلة متوفرة
                      </span>
                    )}
                  </h3>
                </div>

                {searchLoading && (
                  <Card>
                    <CardContent className="py-16 text-center text-slate-500 text-sm font-medium">
                      جاري جلب أحدث الرحلات المجدولة...
                    </CardContent>
                  </Card>
                )}

                {!searchLoading && trips.length > 0 && (
                  <div className="grid grid-cols-1 gap-4">
                    {trips.map((trip) => (
                      <TripCard
                        key={trip.id}
                        trip={trip}
                        onSelectSeats={handleSelectSeats}
                      />
                    ))}
                  </div>
                )}

                {!searchLoading && hasSearched && trips.length === 0 && (
                  <Card>
                    <CardContent className="py-16 text-center space-y-3">
                      <Bus className="h-12 w-12 text-slate-300 mx-auto" />
                      <h4 className="text-base font-bold text-slate-800">
                        لا توجد رحلات مجدولة مطابقة لهذا اليوم
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        يرجى اختيار تاريخ آخر أو تغيير محطة الانطلاق والوصول للبحث في المواعيد الأخرى.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {!hasSearched && (
                  <Card>
                    <CardContent className="py-16 text-center space-y-3">
                      <Bus className="h-12 w-12 text-blue-500 mx-auto" />
                      <h4 className="text-base font-bold text-slate-900">
                        حدد خط السير واضغط "بحث الرحلات"
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        اختر محطة المغادرة والوصول لاستعراض الحافلات الملكية واختيار المقاعد التفاعلي.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* التقارير والتحليلات المالية والتشغيلية */}
          {activeView === 'reports' && <ReportsManager />}

          {/* جدولة وإدارة الرحلات */}
          {activeView === 'trips' && <TripManager />}

          {/* المسارات وخطوط السير (للمدراء فقط) */}
          {activeView === 'routes' && role === 'admin' && <RouteManager />}

          {/* محطات الركاب (للمدراء فقط) */}
          {activeView === 'stations' && role === 'admin' && <StationManager />}

          {/* إدارة أسطول الحافلات */}
          {activeView === 'buses' && <BusManager />}

          {/* إدارة الكباتن والسائقين */}
          {activeView === 'drivers' && <DriverManager />}

          {/* الاستعلام عن تذكرة برقم PNR */}
          {activeView === 'tracking' && <TrackBookingModal inline={true} />}
        </main>
      </div>

      {/* 3. النوافذ المنبثقة التفاعلية (Modals) */}
      {/* نافذة خريطة مقاعد الحافلة */}
      {selectedTripForSeats && (
        <SeatMapModal
          trip={selectedTripForSeats}
          onClose={() => setSelectedTripForSeats(null)}
          onProceedToPassengers={handleProceedToPassengers}
        />
      )}

      {/* نافذة إدخال بيانات المسافرين والدفع */}
      {bookingDraft && (
        <PassengerModal
          bookingDraft={bookingDraft}
          onClose={() => setBookingDraft(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* نافذة التذكرة ورمز الـ QR بعد نجاح الحجز */}
      {bookingSuccessData && (
        <BookingSuccessModal
          booking={bookingSuccessData}
          onClose={() => setBookingSuccessData(null)}
          onNewBooking={() => {
            setBookingSuccessData(null);
            setActiveView('booking');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
