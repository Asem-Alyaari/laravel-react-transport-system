<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Booking;
use App\Models\Bus;
use App\Models\Route;
use App\Models\Ticket;
use App\Models\Trip;
use Carbon\Carbon;

class ReportService
{
    /**
     * جلب ملخص شامل للأداء والعمليات المالية والتشغيلية
     *
     * @return array<string, mixed>
     */
    public function getSummary(?string $startDate = null, ?string $endDate = null, ?int $routeId = null): array
    {
        // 1. استعلام الحجوزات المؤكدة والمدفوعة
        $bookingQuery = Booking::query()
            ->where(function ($q) {
                $q->where('booking_status', 'confirmed')
                  ->orWhere('payment_status', 'paid');
            })
            ->where('booking_status', '!=', 'cancelled');

        if ($startDate) {
            $bookingQuery->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $bookingQuery->whereDate('created_at', '<=', $endDate);
        }
        if ($routeId) {
            $bookingQuery->whereHas('trip', fn ($q) => $q->where('route_id', $routeId));
        }

        $totalRevenue = round((float) ((clone $bookingQuery)->sum('total_amount') ?? 0.0), 2);

        // إيرادات اليوم
        $todayRevenueQuery = Booking::query()
            ->where(function ($q) {
                $q->where('booking_status', 'confirmed')
                  ->orWhere('payment_status', 'paid');
            })
            ->where('booking_status', '!=', 'cancelled')
            ->whereDate('created_at', Carbon::today());

        if ($routeId) {
            $todayRevenueQuery->whereHas('trip', fn ($q) => $q->where('route_id', $routeId));
        }

        $todayRevenue = round((float) ($todayRevenueQuery->sum('total_amount') ?? 0.0), 2);

        // عدد الحجوزات المؤكدة
        $totalBookingsQuery = Booking::query()
            ->where('booking_status', 'confirmed');

        if ($startDate) {
            $totalBookingsQuery->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $totalBookingsQuery->whereDate('created_at', '<=', $endDate);
        }
        if ($routeId) {
            $totalBookingsQuery->whereHas('trip', fn ($q) => $q->where('route_id', $routeId));
        }

        $totalBookings = (int) $totalBookingsQuery->count();

        // 2. استعلام التذاكر الصادرة / المقبولة
        $ticketsQuery = Ticket::query()
            ->whereIn('status', ['valid', 'boarded']);

        if ($startDate) {
            $ticketsQuery->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $ticketsQuery->whereDate('created_at', '<=', $endDate);
        }
        if ($routeId) {
            $ticketsQuery->whereHas('trip', fn ($q) => $q->where('route_id', $routeId));
        }

        $totalTickets = (int) (clone $ticketsQuery)->count();

        // إجمالي الركاب
        $totalPassengers = (int) ((clone $bookingQuery)->sum('total_passengers') ?? 0);
        if ($totalPassengers === 0 && $totalTickets > 0) {
            $totalPassengers = $totalTickets;
        }

        // متوسط سعر التذكرة
        $averageTicketFare = 0.0;
        if ($totalTickets > 0) {
            $avgFare = (clone $ticketsQuery)->avg('fare');
            $averageTicketFare = $avgFare !== null ? round((float) $avgFare, 2) : 0.0;
        } elseif ($totalBookings > 0 && $totalRevenue > 0) {
            $divisor = max(1, $totalPassengers > 0 ? $totalPassengers : $totalBookings);
            $averageTicketFare = round($totalRevenue / $divisor, 2);
        }

        // 3. استعلام الرحلات
        $tripsQuery = Trip::query();
        if ($startDate) {
            $tripsQuery->whereDate('departure_datetime', '>=', $startDate);
        }
        if ($endDate) {
            $tripsQuery->whereDate('departure_datetime', '<=', $endDate);
        }
        if ($routeId) {
            $tripsQuery->where('route_id', $routeId);
        }

        $completedTrips = (int) (clone $tripsQuery)->where('status', 'completed')->count();
        $scheduledTrips = (int) (clone $tripsQuery)->where('status', 'scheduled')->count();

        // حساب متوسط نسبة الإشغال عبر الرحلات المجدولة (أو النشطة كبديل آمن)
        $occupancyTrips = (clone $tripsQuery)
            ->where('status', 'scheduled')
            ->with(['bus.seatLayout', 'tickets' => function ($t) {
                $t->whereIn('status', ['valid', 'boarded']);
            }])
            ->get();

        if ($occupancyTrips->isEmpty()) {
            $occupancyTrips = (clone $tripsQuery)
                ->where('status', '!=', 'cancelled')
                ->with(['bus.seatLayout', 'tickets' => function ($t) {
                    $t->whereIn('status', ['valid', 'boarded']);
                }])
                ->get();
        }

        $totalCapacity = 0;
        $totalBookedSeats = 0;

        foreach ($occupancyTrips as $trip) {
            $seats = (int) ($trip->bus?->seatLayout?->total_seats ?? 0);
            $booked = $trip->tickets->unique('seat_number')->count();
            $totalCapacity += $seats;
            $totalBookedSeats += $booked;
        }

        $averageOccupancyRate = $totalCapacity > 0
            ? round(($totalBookedSeats / $totalCapacity) * 100, 2)
            : 0.0;

        // 4. الحافلات النشطة
        $activeBuses = (int) Bus::where('status', 'active')->count();

        // 5. توزيع طرق الدفع
        $methodLabels = [
            'cash' => 'نقداً',
            'card' => 'بطاقة بنكية',
            'online' => 'دفع إلكتروني',
            'wallet' => 'محفظة إلكترونية',
            'mada' => 'مدى',
            'apple_pay' => 'Apple Pay',
            'bank_transfer' => 'تحويل بنكي',
        ];

        $paymentBreakdown = [];
        $paymentRecords = (clone $bookingQuery)
            ->selectRaw('payment_method, COUNT(*) as count, SUM(total_amount) as total_amount')
            ->groupBy('payment_method')
            ->get();

        foreach ($paymentRecords as $record) {
            $method = (string) $record->payment_method;
            $paymentBreakdown[] = [
                'method' => $method,
                'label' => $methodLabels[$method] ?? ucfirst($method),
                'count' => (int) $record->count,
                'total_amount' => round((float) $record->total_amount, 2),
            ];
        }

        return [
            'total_revenue' => $totalRevenue,
            'today_revenue' => $todayRevenue,
            'total_bookings' => $totalBookings,
            'total_tickets' => $totalTickets,
            'total_passengers' => $totalPassengers,
            'average_ticket_fare' => $averageTicketFare,
            'average_occupancy_rate' => $averageOccupancyRate,
            'completed_trips' => $completedTrips,
            'scheduled_trips' => $scheduledTrips,
            'active_buses' => $activeBuses,
            'payment_methods_breakdown' => $paymentBreakdown,
        ];
    }

    /**
     * جلب بيانات المخطط البياني للإيرادات اليومية وتوزيع الحجوزات
     *
     * @return array<int, array<string, mixed>>
     */
    public function getRevenueChart(?string $startDate = null, ?string $endDate = null, ?int $routeId = null): array
    {
        $today = Carbon::today();

        if ($startDate && $endDate) {
            $start = Carbon::parse($startDate);
            $end = Carbon::parse($endDate);
        } elseif ($startDate) {
            $start = Carbon::parse($startDate);
            $end = Carbon::today();
        } elseif ($endDate) {
            $end = Carbon::parse($endDate);
            $start = (clone $end)->subDays(13);
        } else {
            // افتراضياً آخر 14 يوماً
            $start = (clone $today)->subDays(13);
            $end = $today;
        }

        if ($start->gt($end)) {
            [$start, $end] = [$end, $start];
        }

        // جلب الإيرادات وعدد الحجوزات مقسمة بالأيام
        $bookingsQuery = Booking::query()
            ->selectRaw('DATE(created_at) as date_group, SUM(total_amount) as daily_revenue, COUNT(*) as daily_bookings')
            ->where(function ($q) {
                $q->where('booking_status', 'confirmed')
                  ->orWhere('payment_status', 'paid');
            })
            ->where('booking_status', '!=', 'cancelled')
            ->whereDate('created_at', '>=', $start->toDateString())
            ->whereDate('created_at', '<=', $end->toDateString());

        if ($routeId) {
            $bookingsQuery->whereHas('trip', fn ($q) => $q->where('route_id', $routeId));
        }

        $bookingsByDate = $bookingsQuery->groupBy('date_group')->get()->keyBy('date_group');

        // جلب عدد التذاكر مقسمة بالأيام
        $ticketsQuery = Ticket::query()
            ->selectRaw('DATE(created_at) as date_group, COUNT(*) as daily_tickets')
            ->whereIn('status', ['valid', 'boarded'])
            ->whereDate('created_at', '>=', $start->toDateString())
            ->whereDate('created_at', '<=', $end->toDateString());

        if ($routeId) {
            $ticketsQuery->whereHas('trip', fn ($q) => $q->where('route_id', $routeId));
        }

        $ticketsByDate = $ticketsQuery->groupBy('date_group')->get()->keyBy('date_group');

        $chartData = [];
        $current = $start->copy();

        while ($current->lte($end)) {
            $dateKey = $current->toDateString();
            $booking = $bookingsByDate->get($dateKey);
            $ticket = $ticketsByDate->get($dateKey);

            $chartData[] = [
                'date' => $dateKey,
                'date_label' => $current->locale('ar')->translatedFormat('j F Y'),
                'revenue' => $booking ? round((float) $booking->daily_revenue, 2) : 0.0,
                'bookings_count' => $booking ? (int) $booking->daily_bookings : 0,
                'tickets_count' => $ticket ? (int) $ticket->daily_tickets : 0,
            ];

            $current->addDay();
        }

        return $chartData;
    }

    /**
     * جلب أداء المسارات مرتبة تنازلياً حسب الإيرادات والأداء
     *
     * @return array<int, array<string, mixed>>
     */
    public function getRoutesPerformance(?string $startDate = null, ?string $endDate = null): array
    {
        $routes = Route::with([
            'originStation',
            'destinationStation',
            'trips' => function ($t) use ($startDate, $endDate) {
                if ($startDate) {
                    $t->whereDate('departure_datetime', '>=', $startDate);
                }
                if ($endDate) {
                    $t->whereDate('departure_datetime', '<=', $endDate);
                }
                $t->with(['bus.seatLayout', 'tickets' => function ($tq) {
                    $tq->whereIn('status', ['valid', 'boarded']);
                }]);
            },
        ])->get();

        $performance = [];

        foreach ($routes as $route) {
            $trips = $route->trips;
            $tripIds = $trips->pluck('id')->all();

            $routeRevenue = 0.0;
            $passengersCount = 0;

            if (!empty($tripIds)) {
                $bookingsQuery = Booking::query()
                    ->whereIn('trip_id', $tripIds)
                    ->where(function ($q) {
                        $q->where('booking_status', 'confirmed')
                          ->orWhere('payment_status', 'paid');
                    })
                    ->where('booking_status', '!=', 'cancelled');

                if ($startDate) {
                    $bookingsQuery->whereDate('created_at', '>=', $startDate);
                }
                if ($endDate) {
                    $bookingsQuery->whereDate('created_at', '<=', $endDate);
                }

                $routeRevenue = (float) ((clone $bookingsQuery)->sum('total_amount') ?? 0.0);
                $passengersCount = (int) ((clone $bookingsQuery)->sum('total_passengers') ?? 0);

                if ($passengersCount === 0) {
                    $ticketsQuery = Ticket::query()
                        ->whereIn('trip_id', $tripIds)
                        ->whereIn('status', ['valid', 'boarded']);
                    if ($startDate) {
                        $ticketsQuery->whereDate('created_at', '>=', $startDate);
                    }
                    if ($endDate) {
                        $ticketsQuery->whereDate('created_at', '<=', $endDate);
                    }
                    $passengersCount = (int) $ticketsQuery->count();
                }
            }

            $totalCapacity = 0;
            $totalBookedSeats = 0;

            foreach ($trips as $trip) {
                $capacity = (int) ($trip->bus?->seatLayout?->total_seats ?? 0);
                $booked = $trip->tickets->unique('seat_number')->count();
                $totalCapacity += $capacity;
                $totalBookedSeats += $booked;
            }

            $occupancyRate = $totalCapacity > 0
                ? round(($totalBookedSeats / $totalCapacity) * 100, 2)
                : 0.0;

            $originCity = $route->originStation?->city ?? $route->originStation?->name_ar ?? '';
            $destinationCity = $route->destinationStation?->city ?? $route->destinationStation?->name_ar ?? '';

            $performance[] = [
                'route_id' => (int) $route->id,
                'route_name' => (string) $route->name,
                'origin_city' => (string) $originCity,
                'destination_city' => (string) $destinationCity,
                'trips_count' => count($trips),
                'passengers_count' => $passengersCount,
                'total_revenue' => round($routeRevenue, 2),
                'average_occupancy_rate' => $occupancyRate,
            ];
        }

        // ترتيب المسارات حسب الإيرادات تنازلياً، ثم عدد الركاب
        usort($performance, function (array $a, array $b): int {
            if ($b['total_revenue'] !== $a['total_revenue']) {
                return $b['total_revenue'] <=> $a['total_revenue'];
            }
            return $b['passengers_count'] <=> $a['passengers_count'];
        });

        return $performance;
    }

    /**
     * استخراج كشف ركاب الرحلة (Trip Passenger Manifest) التفصيلي
     *
     * @return array<string, mixed>
     */
    public function getTripManifest(Trip $trip): array
    {
        $trip->loadMissing([
            'route.originStation',
            'route.destinationStation',
            'bus.seatLayout',
            'driver',
            'tickets.passenger',
            'tickets.booking',
            'tickets.fromStation',
            'tickets.toStation',
        ]);

        $manifestPassengers = [];

        // فرز التذاكر بحسب رقم المقعد
        $sortedTickets = $trip->tickets
            ->whereNotIn('status', ['cancelled', 'refunded'])
            ->sortBy(function ($t) {
                return is_numeric($t->seat_number) ? (int) $t->seat_number : $t->seat_number;
            });

        foreach ($sortedTickets as $ticket) {
            $manifestPassengers[] = [
                'ticket_number' => (string) $ticket->ticket_number,
                'seat_number' => (string) $ticket->seat_number,
                'passenger_name' => (string) ($ticket->passenger?->name ?? $ticket->booking?->customer_name ?? ''),
                'national_id' => (string) ($ticket->passenger?->national_id ?? $ticket->booking?->customer_national_id ?? ''),
                'phone' => (string) ($ticket->passenger?->phone ?? $ticket->booking?->customer_phone ?? ''),
                'gender' => (string) ($ticket->passenger?->gender ?? ''),
                'passenger_type' => (string) ($ticket->passenger?->passenger_type ?? 'adult'),
                'from_station' => (string) ($ticket->fromStation?->name_ar ?? $ticket->fromStation?->name_en ?? ''),
                'to_station' => (string) ($ticket->toStation?->name_ar ?? $ticket->toStation?->name_en ?? ''),
                'fare' => round((float) $ticket->fare, 2),
                'status' => (string) $ticket->status,
                'boarded_at' => $ticket->boarded_at?->toISOString(),
            ];
        }

        $totalSeats = (int) ($trip->bus?->seatLayout?->total_seats ?? 0);
        $bookedSeats = count(array_unique(array_column($manifestPassengers, 'seat_number')));
        $occupancyRate = $totalSeats > 0 ? round(($bookedSeats / $totalSeats) * 100, 2) : 0.0;

        return [
            'trip' => [
                'id' => (int) $trip->id,
                'trip_code' => (string) $trip->trip_code,
                'departure_datetime' => $trip->departure_datetime?->toISOString(),
                'arrival_datetime' => $trip->arrival_datetime?->toISOString(),
                'status' => (string) $trip->status,
            ],
            'route' => [
                'id' => $trip->route?->id,
                'name' => $trip->route?->name ?? '',
                'origin' => $trip->route?->originStation?->name_ar ?? $trip->route?->originStation?->name_en ?? '',
                'destination' => $trip->route?->destinationStation?->name_ar ?? $trip->route?->destinationStation?->name_en ?? '',
            ],
            'bus' => [
                'id' => $trip->bus?->id,
                'bus_number' => $trip->bus?->bus_number ?? '',
                'plate_number' => $trip->bus?->plate_number ?? '',
                'model' => $trip->bus?->model ?? '',
                'total_seats' => $totalSeats,
            ],
            'driver' => [
                'id' => $trip->driver?->id,
                'name' => $trip->driver?->name ?? '',
                'phone' => $trip->driver?->phone ?? '',
            ],
            'manifest_passengers' => $manifestPassengers,
            'total_seats' => $totalSeats,
            'booked_seats' => $bookedSeats,
            'occupancy_rate' => $occupancyRate,
        ];
    }
}
