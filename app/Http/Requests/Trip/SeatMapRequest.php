<?php

declare(strict_types=1);

namespace App\Http\Requests\Trip;

use Illuminate\Foundation\Http\FormRequest;

class SeatMapRequest extends FormRequest
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
            'from_station_id' => ['required', 'exists:stations,id'],
            'to_station_id' => ['required', 'exists:stations,id', 'different:from_station_id'],
            'session_id' => ['nullable', 'string'],
        ];
    }
}
