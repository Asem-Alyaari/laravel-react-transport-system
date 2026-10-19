<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Route;
use App\Models\RouteStop;
use App\Models\SegmentFare;
use App\Models\Trip;
use App\Models\TripStop;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class TripService
{
    public function __construct(
        protected readonly SeatAvailabilityService $seatService
    ) {}

    /**
     * جلب قائمة الرحلات مع الفلترة ودعم البحث
     *
     * @return Collection<int, Trip>
     */
    public function listTrips(?string $search = null, ?string $status = null, ?string $routeId = null): Collection
    {
        $query = Trip::with([
            'route.originStation',
            'route.destinationStation',
            'bus.seatLayout',
            'driver',
            'stops.station',
        ])
        ->withCount('bookings')
        ->orderBy('id', 'desc');

        if ($status) {
            $query->where('status', $status);
        }

        if ($routeId) {
            $query->where('route_id', $routeId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('trip_code', 'like', "%{$search}%")
                  ->orWhereHas('route', function ($rq) use ($search) {
                      $rq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        return $query->get();
    }

    /**
     * إنشاء رحلة جديدة وتوليد محطات التوقف التابعة لها تلقائياً
     *
     * @param array<string, mixed> $data
     */
    public function createTrip(array $data): Trip
    {
        return DB::transaction(function () use ($data) {
            do {
                $tripCode = 'TRP-' . strtoupper(Str::random(6));
            } while (Trip::where('trip_code', $tripCode)->exists());

            $trip = Trip::create([
                'trip_code' => $tripCode,
                'route_id' => $data['route_id'],
                'bus_id' => $data['bus_id'],
                'driver_id' => $data['driver_id'],
                'departure_datetime' => $data['departure_datetime'],
                'arrival_datetime' => $data['arrival_datetime'],
                'base_fare' => $data['base_fare'],
                'status' => $data['status'] ?? 'scheduled',
                'remarks' => $data['remarks'] ?? null,
            ]);

            $this->createTripStopsForRoute($trip);

            return $trip->load([
                'route.originStation',
                'route.destinationStation',
                'bus.seatLayout',
                'driver',
                'stops.station',
            ]);
        });
    }

    /**
     * تعديل بيانات الرحلة وإعادة إنشاء المحطات إذا تغير المسار أو التوقيت
     *
     * @param array<string, mixed> $data
     */
    public function updateTrip(Trip $trip, array $data): Trip
    {
        return DB::transaction(function () use ($trip, $data) {
            $oldRouteId = (int) $trip->route_id;
            $trip->update($data);

            $routeChanged = isset($data['route_id']) && (int) $data['route_id'] !== $oldRouteId;
            $scheduleChanged = isset($data['departure_datetime']) || isset($data['arrival_datetime']);

            if ($routeChanged || $scheduleChanged) {
                $trip->stops()->delete();
                $this->createTripStopsForRoute($trip);
            }

            return $trip->refresh()->load([
                'route.originStation',
                'route.destinationStation',
                'bus.seatLayout',
                'driver',
                'stops.station',
            ]);
        });
    }

    /**
     * حذف الرحلة مع التحقق من عدم وجود حجوزات مؤكدة
     *
     * @throws ValidationException
     */
    public function deleteTrip(Trip $trip): void
    {
        $hasConfirmedBookings = $trip->bookings()
            ->where('booking_status', 'confirmed')
            ->exists();

        if ($hasConfirmedBookings) {
            throw ValidationException::withMessages([
                'trip' => ['لا يمكن حذف الرحلة لوجود حجوزات مؤكدة مرتبطة بها.'],
            ]);
        }

        DB::transaction(function () use ($trip) {
            $trip->stops()->delete();
            $trip->delete();
        });
    }

    /**
     * إنشاء محطات التوقف للرحلة استناداً إلى مسارها وتوزيع الأوقات تناسبياً
     */
    protected function createTripStopsForRoute(Trip $trip): void
    {
        $route = Route::with(['stops' => fn($q) => $q->orderBy('stop_order')])->find($trip->route_id);
        if (!$route) {
            return;
        }

        $routeStops = $route->stops;
        $depTime = Carbon::parse($trip->departure_datetime);
        $arrTime = Carbon::parse($trip->arrival_datetime);
        $totalDuration = max(0, $depTime->diffInMinutes($arrTime));

        if ($routeStops->isNotEmpty()) {
            $count = $routeStops->count();
            $maxMins = (int) $routeStops->max('duration_from_origin_minutes');

            foreach ($routeStops as $index => $stop) {
                if ($index === 0) {
                    $scheduledArrival = (clone $depTime);
                    $scheduledDeparture = (clone $depTime);
                } elseif ($index === $count - 1) {
                    $scheduledArrival = (clone $arrTime);
                    $scheduledDeparture = (clone $arrTime);
                } else {
                    if ($maxMins > 0 && $stop->duration_from_origin_minutes > 0) {
                        $arrivalMinutes = (int) round(($stop->duration_from_origin_minutes / $maxMins) * $totalDuration);
                    } else {
                        $arrivalMinutes = (int) round(($index / ($count - 1)) * $totalDuration);
                    }

                    $scheduledArrival = (clone $depTime)->addMinutes($arrivalMinutes);
                    $dwell = (int) ($stop->dwell_time_minutes > 0 ? $stop->dwell_time_minutes : 15);
                    $scheduledDeparture = (clone $scheduledArrival)->addMinutes($dwell);

                    if ($scheduledDeparture->gt($arrTime)) {
                        $scheduledDeparture = (clone $arrTime);
                    }
                }

                TripStop::create([
                    'trip_id' => $trip->id,
                    'station_id' => $stop->station_id,
                    'stop_order' => $stop->stop_order ?? ($index + 1),
                    'scheduled_arrival' => $scheduledArrival,
                    'scheduled_departure' => $scheduledDeparture,
                    'status' => 'pending',
                ]);
            }
        } elseif ($route->origin_station_id && $route->destination_station_id) {
            // المسار لا يحتوي على محطات بينية، إنشاء محطة البداية ومحطة النهاية فقط
            TripStop::create([
                'trip_id' => $trip->id,
                'station_id' => $route->origin_station_id,
                'stop_order' => 1,
                'scheduled_arrival' => $depTime,
                'scheduled_departure' => $depTime,
                'status' => 'pending',
            ]);

            TripStop::create([
                'trip_id' => $trip->id,
                'station_id' => $route->destination_station_id,
                'stop_order' => 2,
                'scheduled_arrival' => $arrTime,
                'scheduled_departure' => $arrTime,
                'status' => 'pending',
            ]);
        }
    }

    /**
     * البحث عن الرحلات المتاحة بين أي محطتين على المسار
     *
     * @return array<int, array<string, mixed>>
     */
    public function searchTrips(int $originId, int $destinationId, ?string $dateString = null): array
    {
        $travelDate = $dateString ? Carbon::parse($dateString) : Carbon::today();

        // 1. استخراج الخطوط الصالحة
        $originStops = RouteStop::where('station_id', $originId)->get();
        $validRoutes = [];

        foreach ($originStops as $origStop) {
            $destStop = RouteStop::where('route_id', $origStop->route_id)
                ->where('station_id', $destinationId)
                ->where('stop_order', '>', $origStop->stop_order)
                ->first();

            if ($destStop) {
                $validRoutes[$origStop->route_id] = [
                    'route_id' => $origStop->route_id,
                    'origin_order' => $origStop->stop_order,
                    'dest_order' => $destStop->stop_order,
                ];
            }
        }

        if (empty($validRoutes)) {
            return [];
        }

        $routeIds = array_keys($validRoutes);

        // 2. البحث عن الرحلات المجدولة
        $trips = Trip::with(['route', 'bus.seatLayout', 'driver', 'stops.station'])
            ->whereIn('route_id', $routeIds)
            ->whereDate('departure_datetime', $travelDate->toDateString())
            ->whereIn('status', ['scheduled', 'boarding'])
            ->orderBy('departure_datetime')
            ->get();

        if ($trips->isEmpty()) {
            $trips = Trip::with(['route', 'bus.seatLayout', 'driver', 'stops.station'])
                ->whereIn('route_id', $routeIds)
                ->where('departure_datetime', '>=', now())
                ->whereIn('status', ['scheduled', 'boarding'])
                ->orderBy('departure_datetime')
                ->limit(10)
                ->get();
        }

        $results = [];

        foreach ($trips as $trip) {
            $fareObj = SegmentFare::where('route_id', $trip->route_id)
                ->where('from_station_id', $originId)
                ->where('to_station_id', $destinationId)
                ->first();

            $fare = $fareObj ? $fareObj->fare : $trip->base_fare;
            $vipFare = $fareObj ? $fareObj->vip_fare : null;

            $originTripStop = $trip->stops->firstWhere('station_id', $originId);
            $destTripStop = $trip->stops->firstWhere('station_id', $destinationId);

            $depTime = $originTripStop ? $originTripStop->scheduled_departure : $trip->departure_datetime;
            $arrTime = $destTripStop ? $destTripStop->scheduled_arrival : $trip->arrival_datetime;

            try {
                $seatData = $this->seatService->getSeatMap($trip, $originId, $destinationId);
                $availableSeatsCount = count(array_filter($seatData['seats'], fn($s) => $s['status'] === 'available'));
            } catch (\Exception) {
                $availableSeatsCount = $trip->bus->seatLayout->total_seats;
            }

            $results[] = [
                'id' => $trip->id,
                'trip_code' => $trip->trip_code,
                'route_name' => $trip->route->name,
                'departure_datetime' => $depTime,
                'arrival_datetime' => $arrTime,
                'duration_minutes' => Carbon::parse($depTime)->diffInMinutes(Carbon::parse($arrTime)),
                'fare' => (float) $fare,
                'vip_fare' => $vipFare ? (float) $vipFare : null,
                'bus' => [
                    'bus_number' => $trip->bus->bus_number,
                    'model' => $trip->bus->model,
                    'bus_type' => $trip->bus->seatLayout->bus_type,
                    'amenities' => $trip->bus->amenities,
                    'total_seats' => $trip->bus->seatLayout->total_seats,
                    'available_seats' => $availableSeatsCount,
                ],
                'origin_station_id' => $originId,
                'destination_station_id' => $destinationId,
            ];
        }

        return $results;
    }

    /**
     * جلب خريطة المقاعد مع أسعار المقطع
     *
     * @return array<string, mixed>
     */
    public function getSeatMap(Trip $trip, int $fromStationId, int $toStationId, ?string $sessionId = null): array
    {
        $seatMap = $this->seatService->getSeatMap($trip, $fromStationId, $toStationId, $sessionId);

        $fareObj = SegmentFare::where('route_id', $trip->route_id)
            ->where('from_station_id', $fromId = $fromStationId)
            ->where('to_station_id', $toStationId)
            ->first();

        $seatMap['segment_fare'] = $fareObj ? (float) $fareObj->fare : (float) $trip->base_fare;
        $seatMap['vip_fare'] = $fareObj && $fareObj->vip_fare ? (float) $fareObj->vip_fare : null;

        return $seatMap;
    }
}
