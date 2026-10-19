<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Driver;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class DriverService
{
    /**
     * جلب قائمة السائقين مع دعم البحث والفلترة
     *
     * @return Collection<int, Driver>
     */
    public function listDrivers(?string $search = null, ?string $status = null): Collection
    {
        $query = Driver::withCount('trips')->orderBy('id', 'desc');

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('license_number', 'like', "%{$search}%");
            });
        }

        return $query->get();
    }

    /**
     * تسجيل سائق جديد
     *
     * @param array<string, mixed> $data
     */
    public function createDriver(array $data): Driver
    {
        return Driver::create([
            'name' => $data['name'],
            'phone' => $data['phone'],
            'license_number' => $data['license_number'],
            'license_expiry' => $data['license_expiry'] ?? null,
            'status' => $data['status'] ?? 'available',
        ]);
    }

    /**
     * تحديث بيانات سائق
     *
     * @param array<string, mixed> $data
     */
    public function updateDriver(Driver $driver, array $data): Driver
    {
        $driver->update($data);
        return $driver->refresh();
    }

    /**
     * حذف سائق مع التحقق من عدم وجود رحلات مجدولة
     *
     * @throws ValidationException
     */
    public function deleteDriver(Driver $driver): bool
    {
        $hasActiveTrips = $driver->trips()
            ->whereIn('status', ['scheduled', 'boarding', 'in_transit'])
            ->exists();

        if ($hasActiveTrips) {
            throw ValidationException::withMessages([
                'driver' => ['لا يمكن حذف السائق لوجود رحلات مجدولة مرتبطة به.'],
            ]);
        }

        return (bool) $driver->delete();
    }
}
