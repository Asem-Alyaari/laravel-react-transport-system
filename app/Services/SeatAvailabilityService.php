<?php

namespace App\Services;

use App\Models\RouteStop;
use App\Models\SeatLock;
use App\Models\Ticket;
use App\Models\Trip;

class SeatAvailabilityService
{
    /**
     * فحص وتوليد خريطة المقاعد وحالاتها (متاح، مقفول مؤقتاً، محجوز)
     * بناءً على مقطع الرحلة المختار (المحطة البينية من -> إلى)
     */
    public function getSeatMap(Trip $trip, int $fromStationId, int $toStationId, ?string $currentSessionId = null): array
    {
        $routeId = $trip->route_id;

        // 1. تحديد الترتيب التصاعدي لمحطة الصعود ومحطة النزول
        $fromStop = RouteStop::where('route_id', $routeId)
            ->where('station_id', $fromStationId)
            ->first();

        $toStop = RouteStop::where('route_id', $routeId)
            ->where('station_id', $toStationId)
            ->first();

        if (!$fromStop || !$toStop || $fromStop->stop_order >= $toStop->stop_order) {
            throw new \InvalidArgumentException('محطة النزول يجب أن تكون بعد محطة الصعود على خط السير.');
        }

        $fromOrder = $fromStop->stop_order;
        $toOrder = $toStop->stop_order;

        // 2. البحث عن التذاكر المحجوزة التي تتداخل مع المقطع المطلوب
        // شرط التداخل: تذكرة تبدأ قبل نهاية الرحلة المطلوبة وتنتهي بعد بداية الرحلة المطلوبة
        $bookedSeats = Ticket::where('trip_id', $trip->id)
            ->whereIn('status', ['valid', 'boarded'])
            ->where('from_stop_order', '<', $toOrder)
            ->where('to_stop_order', '>', $fromOrder)
            ->pluck('seat_number')
            ->toArray();

        // 3. البحث عن الأقفال المؤقتة الحية (Seat Locks)
        $lockedQuery = SeatLock::where('trip_id', $trip->id)
            ->where('locked_until', '>', now())
            ->where('from_stop_order', '<', $toOrder)
            ->where('to_stop_order', '>', $fromOrder);

        if ($currentSessionId) {
            // استثناء القفل الخاص بنفس جلسة المستخدم الحالي حتى يظهر له كمحدد (selected)
            $lockedQuery->where('session_id', '!=', $currentSessionId);
        }

        $lockedSeats = $lockedQuery->pluck('seat_number')->toArray();

        // 4. خريطة المقاعد من قالب الحافلة
        $seatLayout = $trip->bus->seatLayout;
        $rawSeats = $seatLayout->layout_json ?? [];

        $processedSeats = array_map(function ($seat) use ($bookedSeats, $lockedSeats) {
            $seatNumber = (string) ($seat['seat_number'] ?? '');

            if (in_array($seatNumber, $bookedSeats, true)) {
                $status = 'booked'; // محجوز ومباع نهائياً
            } elseif (in_array($seatNumber, $lockedSeats, true)) {
                $status = 'locked'; // محجوز مؤقتاً في سلة شراء شخص آخر
            } else {
                $status = 'available'; // متاح للشراء
            }

            return array_merge($seat, [
                'status' => $status,
            ]);
        }, $rawSeats);

        return [
            'trip_id' => $trip->id,
            'trip_code' => $trip->trip_code,
            'bus_number' => $trip->bus->bus_number,
            'bus_type' => $seatLayout->bus_type,
            'layout_name' => $seatLayout->name,
            'total_seats' => $seatLayout->total_seats,
            'total_rows' => $seatLayout->total_rows,
            'columns_per_row' => $seatLayout->columns_per_row,
            'from_stop_order' => $fromOrder,
            'to_stop_order' => $toOrder,
            'seats' => $processedSeats,
        ];
    }
}
