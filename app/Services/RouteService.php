<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Route;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RouteService
{
    /**
     * جلب قائمة المسارات مع العلاقات وعدد الرحلات ومحطات التوقف
     *
     * @return Collection<int, Route>
     */
    public function listRoutes(?string $search = null, ?bool $activeOnly = false): Collection
    {
        $query = Route::with(['originStation', 'destinationStation', 'stops.station'])
            ->withCount(['trips', 'stops'])
            ->orderBy('id', 'asc');

        if ($activeOnly === true) {
            $query->where('is_active', true);
        }

        if ($search !== null && trim($search) !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('originStation', function ($sq) use ($search) {
                      $sq->where('city', 'like', "%{$search}%")
                         ->orWhere('name_ar', 'like', "%{$search}%")
                         ->orWhere('name_en', 'like', "%{$search}%");
                  })
                  ->orWhereHas('destinationStation', function ($sq) use ($search) {
                      $sq->where('city', 'like', "%{$search}%")
                         ->orWhere('name_ar', 'like', "%{$search}%")
                         ->orWhere('name_en', 'like', "%{$search}%");
                  });
            });
        }

        return $query->get();
    }

    /**
     * إنشاء مسار جديد مع محطاته البينية وأسعار المقاطع
     *
     * @param array<string, mixed> $data
     */
    public function createRoute(array $data): Route
    {
        return DB::transaction(function () use ($data): Route {
            $route = Route::create([
                'name' => $data['name'],
                'origin_station_id' => (int) $data['origin_station_id'],
                'destination_station_id' => (int) $data['destination_station_id'],
                'distance_km' => (float) $data['distance_km'],
                'estimated_duration_minutes' => (int) $data['estimated_duration_minutes'],
                'is_active' => isset($data['is_active']) ? (bool) $data['is_active'] : true,
            ]);

            if (isset($data['stops']) && is_array($data['stops'])) {
                $this->syncRouteStops($route, $data['stops']);
            }

            if (isset($data['segment_fares']) && is_array($data['segment_fares'])) {
                $this->syncSegmentFares($route, $data['segment_fares']);
            }

            return $route->load([
                'originStation',
                'destinationStation',
                'stops.station',
                'segmentFares.fromStation',
                'segmentFares.toStation',
            ])->loadCount(['trips', 'stops']);
        });
    }

    /**
     * تحديث بيانات المسار مع مزامنة المحطات وأسعار المقاطع
     *
     * @param array<string, mixed> $data
     */
    public function updateRoute(Route $route, array $data): Route
    {
        return DB::transaction(function () use ($route, $data): Route {
            $fillable = array_intersect_key($data, array_flip([
                'name',
                'origin_station_id',
                'destination_station_id',
                'distance_km',
                'estimated_duration_minutes',
                'is_active',
            ]));

            if (!empty($fillable)) {
                $route->update($fillable);
            }

            if (isset($data['stops']) && is_array($data['stops'])) {
                $this->syncRouteStops($route, $data['stops']);
            }

            if (isset($data['segment_fares']) && is_array($data['segment_fares'])) {
                $this->syncSegmentFares($route, $data['segment_fares']);
            }

            return $route->refresh()->load([
                'originStation',
                'destinationStation',
                'stops.station',
                'segmentFares.fromStation',
                'segmentFares.toStation',
            ])->loadCount(['trips', 'stops']);
        });
    }

    /**
     * حذف مسار مع التحقق من عدم وجود رحلات مجدولة مرتبطة به
     *
     * @throws ValidationException
     */
    public function deleteRoute(Route $route): void
    {
        DB::transaction(function () use ($route): void {
            if ($route->trips()->count() > 0) {
                throw ValidationException::withMessages([
                    'route' => ['لا يمكن حذف المسار لأنه يحتوي على رحلات مجدولة'],
                ]);
            }

            $route->stops()->delete();
            $route->segmentFares()->delete();
            $route->delete();
        });
    }

    /**
     * مزامنة المحطات البينية للمسار وضمان وجود محطتي البداية والنهاية
     *
     * @param array<int, array<string, mixed>> $stops
     */
    protected function syncRouteStops(Route $route, array $stops): void
    {
        $originId = (int) $route->origin_station_id;
        $destinationId = (int) $route->destination_station_id;

        $hasOrigin = false;
        $hasDestination = false;

        foreach ($stops as $stop) {
            $stationId = (int) $stop['station_id'];
            if ($stationId === $originId) {
                $hasOrigin = true;
            }
            if ($stationId === $destinationId) {
                $hasDestination = true;
            }
        }

        if (!$hasOrigin) {
            array_unshift($stops, [
                'station_id' => $originId,
                'stop_order' => 1,
                'distance_from_origin_km' => 0.0,
                'duration_from_origin_minutes' => 0,
                'dwell_time_minutes' => 0,
            ]);
        }

        if (!$hasDestination) {
            $stops[] = [
                'station_id' => $destinationId,
                'stop_order' => 999999,
                'distance_from_origin_km' => (float) $route->distance_km,
                'duration_from_origin_minutes' => (int) $route->estimated_duration_minutes,
                'dwell_time_minutes' => 0,
            ];
        }

        // ترتيب المحطات: البداية أولاً، النهاية أخيراً، والمحطات البينية حسب الترتيب أو المسافة
        usort($stops, function (array $a, array $b) use ($originId, $destinationId): int {
            $aStation = (int) $a['station_id'];
            $bStation = (int) $b['station_id'];

            if ($aStation === $originId) {
                return -1;
            }
            if ($bStation === $originId) {
                return 1;
            }
            if ($aStation === $destinationId) {
                return 1;
            }
            if ($bStation === $destinationId) {
                return -1;
            }

            $aOrder = isset($a['stop_order']) ? (int) $a['stop_order'] : 0;
            $bOrder = isset($b['stop_order']) ? (int) $b['stop_order'] : 0;

            if ($aOrder === $bOrder) {
                $aDist = isset($a['distance_from_origin_km']) ? (float) $a['distance_from_origin_km'] : 0.0;
                $bDist = isset($b['distance_from_origin_km']) ? (float) $b['distance_from_origin_km'] : 0.0;
                return $aDist <=> $bDist;
            }

            return $aOrder <=> $bOrder;
        });

        $route->stops()->delete();

        $seenStations = [];
        $order = 1;

        foreach ($stops as $stop) {
            $stId = (int) $stop['station_id'];
            if (isset($seenStations[$stId])) {
                continue;
            }
            $seenStations[$stId] = true;

            $route->stops()->create([
                'station_id' => $stId,
                'stop_order' => $order++,
                'distance_from_origin_km' => isset($stop['distance_from_origin_km']) ? (float) $stop['distance_from_origin_km'] : 0.0,
                'duration_from_origin_minutes' => isset($stop['duration_from_origin_minutes']) ? (int) $stop['duration_from_origin_minutes'] : 0,
                'dwell_time_minutes' => isset($stop['dwell_time_minutes']) ? (int) $stop['dwell_time_minutes'] : 0,
            ]);
        }
    }

    /**
     * مزامنة أسعار المقاطع الخاصة بالمسار
     *
     * @param array<int, array<string, mixed>> $fares
     */
    protected function syncSegmentFares(Route $route, array $fares): void
    {
        $route->segmentFares()->delete();

        $seen = [];
        foreach ($fares as $fare) {
            $fromId = (int) $fare['from_station_id'];
            $toId = (int) $fare['to_station_id'];
            $key = "{$fromId}_{$toId}";

            if (isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;

            $route->segmentFares()->create([
                'from_station_id' => $fromId,
                'to_station_id' => $toId,
                'fare' => (float) $fare['fare'],
                'vip_fare' => isset($fare['vip_fare']) && $fare['vip_fare'] !== null ? (float) $fare['vip_fare'] : null,
                'child_fare' => isset($fare['child_fare']) && $fare['child_fare'] !== null ? (float) $fare['child_fare'] : null,
            ]);
        }
    }
}
