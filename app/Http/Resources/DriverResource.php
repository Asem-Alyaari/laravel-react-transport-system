<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property string $name
 * @property string $phone
 * @property string $license_number
 * @property \Carbon\Carbon|null $license_expiry
 * @property string $status
 * @property int|null $trips_count
 */
class DriverResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone,
            'license_number' => $this->license_number,
            'license_expiry' => $this->license_expiry?->format('Y-m-d'),
            'status' => $this->status,
            'trips_count' => $this->trips_count ?? 0,
        ];
    }
}
