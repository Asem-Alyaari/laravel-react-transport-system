<?php

declare(strict_types=1);

namespace App\Http\Requests\Bus;

use Illuminate\Foundation\Http\FormRequest;

class StoreBusRequest extends FormRequest
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
            'bus_number' => ['required', 'string', 'max:50', 'unique:buses,bus_number'],
            'plate_number' => ['required', 'string', 'max:50'],
            'seat_layout_id' => ['required', 'exists:seat_layouts,id'],
            'model' => ['nullable', 'string', 'max:100'],
            'manufacture_year' => ['nullable', 'integer', 'min:2000', 'max:' . ((int) date('Y') + 1)],
            'amenities' => ['nullable', 'array'],
            'amenities.*' => ['string'],
            'status' => ['nullable', 'in:active,maintenance,out_of_service'],
        ];
    }
}
