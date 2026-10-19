<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property string $ticket_number
 * @property string $seat_number
 * @property float $fare
 * @property string $qr_code_hash
 * @property string $status
 * @property \Carbon\Carbon|null $boarded_at
 */
class TicketResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        if (is_array($this->resource)) {
            return $this->resource;
        }

        return [
            'id' => $this->id,
            'ticket_number' => $this->ticket_number,
            'passenger_name' => $this->passenger?->name,
            'seat_number' => $this->seat_number,
            'fare' => (float) $this->fare,
            'qr_code_hash' => $this->qr_code_hash,
            'status' => $this->status,
            'boarded_at' => $this->boarded_at?->toISOString(),
            'from_station' => new StationResource($this->whenLoaded('fromStation')),
            'to_station' => new StationResource($this->whenLoaded('toStation')),
        ];
    }
}
