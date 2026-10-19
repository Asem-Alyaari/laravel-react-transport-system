<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Bus;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class BusService
{
    /**
     * جلب أسطول الحافلات
     *
     * @return Collection<int, Bus>
     */
    public function listBuses(?string $search = null, ?string $status = null): Collection
    {
        $query = Bus::with('seatLayout')->withCount('trips')->orderBy('id', 'desc');

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('bus_number', 'like', "%{$search}%")
                  ->orWhere('plate_number', 'like', "%{$search}%")
                  ->orWhere('model', 'like', "%{$search}%");
            });
        }

        return $query->get();
    }

    /**
     * إضافة حافلة جديدة للأسطول
     *
     * @param array<string, mixed> $data
     */
    public function createBus(array $data): Bus
    {
        $bus = Bus::create([
            'bus_number' => $data['bus_number'],
            'plate_number' => $data['plate_number'],
            'seat_layout_id' => $data['seat_layout_id'],
            'model' => $data['model'] ?? null,
            'manufacture_year' => $data['manufacture_year'] ?? null,
            'amenities' => $data['amenities'] ?? [],
            'status' => $data['status'] ?? 'active',
        ]);

        return $bus->load('seatLayout');
    }

    /**
     * تحديث بيانات حافلة
     *
     * @param array<string, mixed> $data
     */
    public function updateBus(Bus $bus, array $data): Bus
    {
        $bus->update($data);
        return $bus->load('seatLayout');
    }

    /**
     * حذف حافلة من الأسطول مع التحقق من الرحلات المجدولة
     *
     * @throws ValidationException
     */
    public function deleteBus(Bus $bus): bool
    {
        $hasActiveTrips = $bus->trips()
            ->whereIn('status', ['scheduled', 'boarding', 'in_transit'])
            ->exists();

        if ($hasActiveTrips) {
            throw ValidationException::withMessages([
                'bus' => ['لا يمكن حذف الحافلة لوجود رحلات مجدولة مرتبطة بها.'],
            ]);
        }

        return (bool) $bus->delete();
    }
}
