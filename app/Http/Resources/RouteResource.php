<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property string $name
 * @property int $origin_station_id
 * @property int $destination_station_id
 * @property float $distance_km
 * @property int $estimated_duration_minutes
 * @property bool $is_active
 * @property int|null $stops_count
 * @property int|null $trips_count
 * @property \App\Models\Station|null $originStation
 * @property \App\Models\Station|null $destinationStation
 * @property \Illuminate\Database\Eloquent\Collection<int, \App\Models\RouteStop>|null $stops
 * @property \Illuminate\Database\Eloquent\Collection<int, \App\Models\SegmentFare>|null $segmentFares
 */
class RouteResource extends JsonResource
{
    /**
     * تحويل المسار إلى مصفوفة قابلة للعرض
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'origin_station_id' => $this->origin_station_id,
            'destination_station_id' => $this->destination_station_id,
            'origin_station' => $this->originStation ? [
                'id' => $this->originStation->id,
                'name' => $this->originStation->name_ar ?? $this->originStation->name_en,
                'name_ar' => $this->originStation->name_ar,
                'name_en' => $this->originStation->name_en,
                'city_name' => $this->originStation->city,
                'city' => $this->originStation->city,
            ] : null,
            'destination_station' => $this->destinationStation ? [
                'id' => $this->destinationStation->id,
                'name' => $this->destinationStation->name_ar ?? $this->destinationStation->name_en,
                'name_ar' => $this->destinationStation->name_ar,
                'name_en' => $this->destinationStation->name_en,
                'city_name' => $this->destinationStation->city,
                'city' => $this->destinationStation->city,
            ] : null,
            'distance_km' => (float) $this->distance_km,
            'estimated_duration_minutes' => (int) $this->estimated_duration_minutes,
            'is_active' => (bool) $this->is_active,
            'stops_count' => $this->stops_count ?? ($this->relationLoaded('stops') && $this->stops ? $this->stops->count() : 0),
            'trips_count' => $this->trips_count ?? 0,
            'stops' => $this->whenLoaded('stops', function () {
                return $this->stops->map(function ($stop) {
                    return [
                        'id' => $stop->id,
                        'route_id' => $stop->route_id,
                        'station_id' => $stop->station_id,
                        'stop_order' => (int) $stop->stop_order,
                        'distance_from_origin_km' => (float) $stop->distance_from_origin_km,
                        'duration_from_origin_minutes' => (int) $stop->duration_from_origin_minutes,
                        'dwell_time_minutes' => (int) $stop->dwell_time_minutes,
                        'station' => $stop->relationLoaded('station') && $stop->station ? [
                            'id' => $stop->station->id,
                            'name_ar' => $stop->station->name_ar,
                            'name_en' => $stop->station->name_en,
                            'code' => $stop->station->code,
                            'city' => $stop->station->city,
                        ] : null,
                    ];
                });
            }),
            'segment_fares' => $this->whenLoaded('segmentFares', function () {
                return $this->segmentFares->map(function ($fare) {
                    return [
                        'id' => $fare->id,
                        'route_id' => $fare->route_id,
                        'from_station_id' => $fare->from_station_id,
                        'to_station_id' => $fare->to_station_id,
                        'fare' => (float) $fare->fare,
                        'vip_fare' => $fare->vip_fare !== null ? (float) $fare->vip_fare : null,
                        'child_fare' => $fare->child_fare !== null ? (float) $fare->child_fare : null,
                        'from_station' => $fare->relationLoaded('fromStation') && $fare->fromStation ? [
                            'id' => $fare->fromStation->id,
                            'name_ar' => $fare->fromStation->name_ar,
                            'name_en' => $fare->fromStation->name_en,
                            'code' => $fare->fromStation->code,
                            'city' => $fare->fromStation->city,
                        ] : null,
                        'to_station' => $fare->relationLoaded('toStation') && $fare->toStation ? [
                            'id' => $fare->toStation->id,
                            'name_ar' => $fare->toStation->name_ar,
                            'name_en' => $fare->toStation->name_en,
                            'code' => $fare->toStation->code,
                            'city' => $fare->toStation->city,
                        ] : null,
                    ];
                });
            }),
        ];
    }
}
