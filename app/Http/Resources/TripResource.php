<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property string $trip_code
 * @property int $route_id
 * @property int $bus_id
 * @property int|null $driver_id
 * @property \Carbon\Carbon|null $departure_datetime
 * @property \Carbon\Carbon|null $arrival_datetime
 * @property float $base_fare
 * @property string $status
 * @property string|null $remarks
 * @property int|null $bookings_count
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property \App\Models\Route|null $route
 * @property \App\Models\Bus|null $bus
 * @property \App\Models\Driver|null $driver
 * @property \Illuminate\Database\Eloquent\Collection|\App\Models\TripStop[]|null $stops
 */
class TripResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // عندما يتم إنشاؤه من مصفوفة نتائج البحث المحسوبة
        if (is_array($this->resource)) {
            return $this->resource;
        }

        return [
            'id' => $this->id,
            'trip_code' => $this->trip_code,
            'route' => new RouteResource($this->whenLoaded('route')),
            'route_name' => $this->route?->name,
            'bus' => new BusResource($this->whenLoaded('bus')),
            'driver' => new DriverResource($this->whenLoaded('driver')),
            'departure_datetime' => $this->departure_datetime?->toISOString(),
            'arrival_datetime' => $this->arrival_datetime?->toISOString(),
            'base_fare' => (float) $this->base_fare,
            'status' => $this->status,
            'remarks' => $this->remarks,
            'bookings_count' => $this->bookings_count ?? ($this->relationLoaded('bookings') ? $this->bookings->count() : 0),
            'stops' => $this->relationLoaded('stops') ? $this->stops->map(function ($stop) {
                return [
                    'id' => $stop->id,
                    'station_id' => $stop->station_id,
                    'station_name' => $stop->station?->name_ar ?? $stop->station?->name_en ?? '',
                    'station_name_ar' => $stop->station?->name_ar,
                    'station_name_en' => $stop->station?->name_en,
                    'city' => $stop->station?->city,
                    'stop_order' => $stop->stop_order,
                    'scheduled_arrival' => $stop->scheduled_arrival?->toISOString(),
                    'scheduled_departure' => $stop->scheduled_departure?->toISOString(),
                    'actual_arrival' => $stop->actual_arrival?->toISOString(),
                    'actual_departure' => $stop->actual_departure?->toISOString(),
                    'status' => $stop->status,
                ];
            }) : [],
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
