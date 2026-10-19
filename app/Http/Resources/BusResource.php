<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property string $bus_number
 * @property string $plate_number
 * @property int $seat_layout_id
 * @property string|null $model
 * @property int|null $manufacture_year
 * @property array|null $amenities
 * @property string $status
 * @property int|null $trips_count
 */
class BusResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'bus_number' => $this->bus_number,
            'plate_number' => $this->plate_number,
            'seat_layout_id' => $this->seat_layout_id,
            'seat_layout' => new SeatLayoutResource($this->whenLoaded('seatLayout')),
            'model' => $this->model,
            'manufacture_year' => $this->manufacture_year,
            'amenities' => $this->amenities ?? [],
            'status' => $this->status,
            'trips_count' => $this->trips_count ?? 0,
        ];
    }
}
