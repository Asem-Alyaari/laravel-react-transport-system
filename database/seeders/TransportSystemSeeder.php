<?php

namespace Database\Seeders;

use App\Models\Bus;
use App\Models\Driver;
use App\Models\Route;
use App\Models\RouteStop;
use App\Models\SeatLayout;
use App\Models\SegmentFare;
use App\Models\Station;
use App\Models\Trip;
use App\Models\TripStop;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TransportSystemSeeder extends Seeder
{
    public function run(): void
    {
        // 1. المحطات الرئيسية
        $stationsData = [
            [
                'name_ar' => 'محطة الرياض المركزية',
                'name_en' => 'Riyadh Central Station',
                'code' => 'RUH',
                'city' => 'الرياض',
                'address' => 'طريق الخرج، جنوب الرياض',
                'latitude' => 24.6333,
                'longitude' => 46.7167,
                'phone' => '0112223333',
                'is_active' => true,
            ],
            [
                'name_ar' => 'محطة القصيم (بريدة)',
                'name_en' => 'Qassim (Buraidah) Station',
                'code' => 'QAS',
                'city' => 'بريدة',
                'address' => 'طريق الملك عبدالعزيز',
                'latitude' => 26.3260,
                'longitude' => 43.9750,
                'phone' => '0163334444',
                'is_active' => true,
            ],
            [
                'name_ar' => 'محطة حائل المركزية',
                'name_en' => 'Hail Central Station',
                'code' => 'HAI',
                'city' => 'حائل',
                'address' => 'حي المنتزه، طريق المدينة',
                'latitude' => 27.5219,
                'longitude' => 41.6907,
                'phone' => '0165556666',
                'is_active' => true,
            ],
            [
                'name_ar' => 'محطة المدينة المنورة المركزية',
                'name_en' => 'Madinah Central Station',
                'code' => 'MED',
                'city' => 'المدينة المنورة',
                'address' => 'طريق الهجرة، بالقرب من الحرم',
                'latitude' => 24.4672,
                'longitude' => 39.6111,
                'phone' => '0148889999',
                'is_active' => true,
            ],
            [
                'name_ar' => 'محطة جدة (المطار القديم)',
                'name_en' => 'Jeddah Station',
                'code' => 'JED',
                'city' => 'جدة',
                'address' => 'طريق الحرمين، حي الفيحاء',
                'latitude' => 21.5433,
                'longitude' => 39.1728,
                'phone' => '0126667777',
                'is_active' => true,
            ],
        ];

        $stations = [];
        foreach ($stationsData as $data) {
            $stations[$data['code']] = Station::updateOrCreate(['code' => $data['code']], $data);
        }

        // 2. قوالب المقاعد (Seat Layouts)
        // بناء خريطة مقاعد VIP (30 مقعد: 2+1)
        $vipSeats = [];
        $seatNum = 1;
        for ($row = 1; $row <= 10; $row++) {
            // عمود 1 (نافذة يسار)
            $vipSeats[] = [
                'seat_number' => (string) $seatNum++,
                'row' => $row,
                'col' => 1,
                'type' => 'window',
                'side' => 'left',
            ];
            // عمود 2 (ممر يسار)
            $vipSeats[] = [
                'seat_number' => (string) $seatNum++,
                'row' => $row,
                'col' => 2,
                'type' => 'aisle',
                'side' => 'left',
            ];
            // عمود 3 (ممر في المنتصف لا يوجد مقعد)
            // عمود 4 (مقعد منفرد يمين نافذة)
            $vipSeats[] = [
                'seat_number' => (string) $seatNum++,
                'row' => $row,
                'col' => 4,
                'type' => 'single_window',
                'side' => 'right',
            ];
        }

        $vipLayout = SeatLayout::updateOrCreate(
            ['name' => 'VIP رويال 30 مقعد (2+1)'],
            [
                'bus_type' => 'vip',
                'total_seats' => 30,
                'total_rows' => 10,
                'columns_per_row' => 4, // 2 يسار + ممر + 1 يمين
                'layout_json' => $vipSeats,
            ]
        );

        // 3. أسطول الحافلات
        $busVip = Bus::updateOrCreate(
            ['bus_number' => 'BUS-VIP-101'],
            [
                'plate_number' => 'أ ب ج 1024',
                'seat_layout_id' => $vipLayout->id,
                'model' => 'Mercedes-Benz Travego VIP 2024',
                'manufacture_year' => 2024,
                'amenities' => ['wifi', 'usb_charger', 'toilet', 'screens', 'ac', 'coffee_bar'],
                'status' => 'active',
            ]
        );

        // 4. السائقين
        $driver = Driver::updateOrCreate(
            ['license_number' => 'DL-908123'],
            [
                'name' => 'عبدالله الشمري',
                'phone' => '0501112233',
                'license_expiry' => '2028-12-31',
                'status' => 'available',
            ]
        );

        // 5. المسارات (Routes)
        $route = Route::updateOrCreate(
            ['name' => 'الرياض ⬅️ المدينة المنورة (عبر القصيم وحائل)'],
            [
                'origin_station_id' => $stations['RUH']->id,
                'destination_station_id' => $stations['MED']->id,
                'distance_km' => 850.00,
                'estimated_duration_minutes' => 540,
                'is_active' => true,
            ]
        );

        // 6. المحطات البينية للمسار (Route Stops)
        $stopsConfig = [
            ['station' => 'RUH', 'order' => 1, 'km' => 0,   'mins' => 0,   'dwell' => 0],
            ['station' => 'QAS', 'order' => 2, 'km' => 350, 'mins' => 210, 'dwell' => 20],
            ['station' => 'HAI', 'order' => 3, 'km' => 600, 'mins' => 370, 'dwell' => 25],
            ['station' => 'MED', 'order' => 4, 'km' => 850, 'mins' => 540, 'dwell' => 0],
        ];

        foreach ($stopsConfig as $sc) {
            RouteStop::updateOrCreate(
                [
                    'route_id' => $route->id,
                    'station_id' => $stations[$sc['station']]->id,
                ],
                [
                    'stop_order' => $sc['order'],
                    'distance_from_origin_km' => $sc['km'],
                    'duration_from_origin_minutes' => $sc['mins'],
                    'dwell_time_minutes' => $sc['dwell'],
                ]
            );
        }

        // 7. أسعار المقاطع (Segment Fares)
        $faresData = [
            ['from' => 'RUH', 'to' => 'QAS', 'fare' => 75.00,  'vip' => 95.00],
            ['from' => 'RUH', 'to' => 'HAI', 'fare' => 125.00, 'vip' => 155.00],
            ['from' => 'RUH', 'to' => 'MED', 'fare' => 175.00, 'vip' => 220.00],
            ['from' => 'QAS', 'to' => 'HAI', 'fare' => 55.00,  'vip' => 70.00],
            ['from' => 'QAS', 'to' => 'MED', 'fare' => 110.00, 'vip' => 140.00],
            ['from' => 'HAI', 'to' => 'MED', 'fare' => 80.00,  'vip' => 100.00],
        ];

        foreach ($faresData as $f) {
            SegmentFare::updateOrCreate(
                [
                    'route_id' => $route->id,
                    'from_station_id' => $stations[$f['from']]->id,
                    'to_station_id' => $stations[$f['to']]->id,
                ],
                [
                    'fare' => $f['fare'],
                    'vip_fare' => $f['vip'],
                    'child_fare' => round($f['fare'] * 0.75, 2),
                ]
            );
        }

        // 8. رحلة مجدولة تجريبية (غداً صباحاً)
        $depTime = Carbon::tomorrow()->setHour(8)->setMinute(0)->setSecond(0);
        $arrTime = (clone $depTime)->addMinutes(540);

        $trip = Trip::updateOrCreate(
            ['trip_code' => 'TRP-' . Carbon::tomorrow()->format('Ymd') . '-001'],
            [
                'route_id' => $route->id,
                'bus_id' => $busVip->id,
                'driver_id' => $driver->id,
                'departure_datetime' => $depTime,
                'arrival_datetime' => $arrTime,
                'base_fare' => 175.00,
                'status' => 'scheduled',
                'remarks' => 'رحلة VIP مباشرة مع توقف استراحة في القصيم وحائل',
            ]
        );

        // توقيتات محطات الرحلة
        TripStop::updateOrCreate(
            ['trip_id' => $trip->id, 'stop_order' => 1],
            [
                'station_id' => $stations['RUH']->id,
                'scheduled_arrival' => $depTime,
                'scheduled_departure' => $depTime,
                'status' => 'pending',
            ]
        );

        TripStop::updateOrCreate(
            ['trip_id' => $trip->id, 'stop_order' => 2],
            [
                'station_id' => $stations['QAS']->id,
                'scheduled_arrival' => (clone $depTime)->addMinutes(210),
                'scheduled_departure' => (clone $depTime)->addMinutes(230),
                'status' => 'pending',
            ]
        );

        TripStop::updateOrCreate(
            ['trip_id' => $trip->id, 'stop_order' => 3],
            [
                'station_id' => $stations['HAI']->id,
                'scheduled_arrival' => (clone $depTime)->addMinutes(370),
                'scheduled_departure' => (clone $depTime)->addMinutes(395),
                'status' => 'pending',
            ]
        );

        TripStop::updateOrCreate(
            ['trip_id' => $trip->id, 'stop_order' => 4],
            [
                'station_id' => $stations['MED']->id,
                'scheduled_arrival' => $arrTime,
                'scheduled_departure' => $arrTime,
                'status' => 'pending',
            ]
        );
    }
}
