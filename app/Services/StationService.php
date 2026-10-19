<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Station;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class StationService
{
    /**
     * جلب قائمة المحطات مع دعم البحث والفلترة وعدد المسارات المرتبطة
     *
     * @return Collection<int, Station>
     */
    public function listStations(?string $search = null, ?bool $activeOnly = false): Collection
    {
        $query = Station::withCount(['originRoutes', 'destinationRoutes', 'routeStops'])
            ->orderBy('city')
            ->orderBy('name_ar');

        if ($activeOnly === true) {
            $query->where('is_active', true);
        }

        if ($search !== null && trim($search) !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name_ar', 'like', "%{$search}%")
                  ->orWhere('name_en', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }

        return $query->get();
    }

    /**
     * إنشاء محطة جديدة
     *
     * @param array<string, mixed> $data
     */
    public function createStation(array $data): Station
    {
        return Station::create([
            'name_ar' => $data['name_ar'],
            'name_en' => $data['name_en'],
            'code' => strtoupper((string) $data['code']),
            'city' => $data['city'],
            'address' => $data['address'] ?? null,
            'latitude' => isset($data['latitude']) ? (float) $data['latitude'] : null,
            'longitude' => isset($data['longitude']) ? (float) $data['longitude'] : null,
            'phone' => $data['phone'] ?? null,
            'is_active' => isset($data['is_active']) ? (bool) $data['is_active'] : true,
        ]);
    }

    /**
     * تحديث بيانات محطة قائمة
     *
     * @param array<string, mixed> $data
     */
    public function updateStation(Station $station, array $data): Station
    {
        if (isset($data['code'])) {
            $data['code'] = strtoupper((string) $data['code']);
        }

        $station->update($data);

        return $station->refresh();
    }

    /**
     * حذف محطة مع التحقق من عدم وجود مسارات أو محطات توقف مرتبطة بها
     *
     * @throws ValidationException
     */
    public function deleteStation(Station $station): void
    {
        $hasLinkedRoutes = $station->originRoutes()->exists()
            || $station->destinationRoutes()->exists()
            || $station->routeStops()->exists();

        if ($hasLinkedRoutes) {
            throw ValidationException::withMessages([
                'station' => ['لا يمكن حذف المحطة لأنها مرتبطة بمسارات وخطوط سير قائمة'],
            ]);
        }

        $station->delete();
    }
}
