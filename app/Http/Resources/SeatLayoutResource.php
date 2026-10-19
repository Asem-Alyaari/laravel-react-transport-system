<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property string $name
 * @property string $bus_type
 * @property int $total_seats
 * @property int $total_rows
 * @property int $columns_per_row
 * @property array $layout_json
 */
class SeatLayoutResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'bus_type' => $this->bus_type,
            'total_seats' => $this->total_seats,
            'total_rows' => $this->total_rows,
            'columns_per_row' => $this->columns_per_row,
            'layout_json' => $this->when($request->routeIs('seat-layouts.show'), $this->layout_json),
        ];
    }
}
