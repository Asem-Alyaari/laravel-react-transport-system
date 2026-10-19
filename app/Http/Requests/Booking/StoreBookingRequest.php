<?php

declare(strict_types=1);

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'trip_id' => ['required', 'exists:trips,id'],
            'from_station_id' => ['required', 'exists:stations,id'],
            'to_station_id' => ['required', 'exists:stations,id', 'different:from_station_id'],
            'customer_name' => ['required', 'string', 'max:150'],
            'customer_phone' => ['required', 'string', 'max:20'],
            'customer_email' => ['nullable', 'email', 'max:150'],
            'customer_national_id' => ['nullable', 'string', 'max:30'],
            'payment_method' => ['nullable', 'string', 'in:cash,card,mada,wallet,online'],
            'passengers' => ['required', 'array', 'min:1'],
            'passengers.*.name' => ['required', 'string', 'max:150'],
            'passengers.*.national_id' => ['nullable', 'string', 'max:30'],
            'passengers.*.gender' => ['required', 'in:male,female'],
            'passengers.*.passenger_type' => ['nullable', 'in:adult,child,infant'],
            'passengers.*.seat_number' => ['required', 'string'],
        ];
    }
}
