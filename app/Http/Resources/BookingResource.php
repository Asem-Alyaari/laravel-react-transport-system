<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
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
            'booking_reference' => $this->booking_reference,
            'trip_code' => $this->trip?->trip_code,
            'route_name' => $this->trip?->route?->name,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'customer_email' => $this->customer_email,
            'total_passengers' => $this->total_passengers,
            'subtotal' => (float) $this->subtotal_amount,
            'tax' => (float) $this->tax_amount,
            'total_amount' => (float) $this->total_amount,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'booking_status' => $this->booking_status,
            'tickets' => TicketResource::collection($this->whenLoaded('tickets')),
        ];
    }
}
