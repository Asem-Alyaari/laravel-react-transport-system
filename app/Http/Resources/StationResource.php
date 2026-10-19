<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property string $name_ar
 * @property string $name_en
 * @property string $code
 * @property string $city
 * @property string|null $address
 * @property float|null $latitude
 * @property float|null $longitude
 * @property string|null $phone
 * @property bool $is_active
 * @property int|null $origin_routes_count
 * @property int|null $destination_routes_count
 * @property int|null $route_stops_count
 * @property \Illuminate\Database\Eloquent\Collection<int, \App\Models\Route>|null $originRoutes
 * @property \Illuminate\Database\Eloquent\Collection<int, \App\Models\Route>|null $destinationRoutes
 * @property \Illuminate\Database\Eloquent\Collection<int, \App\Models\RouteStop>|null $routeStops
 */
class StationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name_ar' => $this->name_ar,
            'name_en' => $this->name_en,
            'code' => $this->code,
            'city' => $this->city,
            'address' => $this->address,
            'latitude' => $this->latitude !== null ? (float) $this->latitude : null,
            'longitude' => $this->longitude !== null ? (float) $this->longitude : null,
            'phone' => $this->phone,
            'is_active' => (bool) $this->is_active,
            'origin_routes_count' => $this->when(
                isset($this->origin_routes_count) || $this->relationLoaded('originRoutes'),
                fn () => (int) ($this->origin_routes_count ?? ($this->originRoutes ? $this->originRoutes->count() : 0))
            ),
            'destination_routes_count' => $this->when(
                isset($this->destination_routes_count) || $this->relationLoaded('destinationRoutes'),
                fn () => (int) ($this->destination_routes_count ?? ($this->destinationRoutes ? $this->destinationRoutes->count() : 0))
            ),
            'route_stops_count' => $this->when(
                isset($this->route_stops_count) || $this->relationLoaded('routeStops'),
                fn () => (int) ($this->route_stops_count ?? ($this->routeStops ? $this->routeStops->count() : 0))
            ),
        ];
    }
}
