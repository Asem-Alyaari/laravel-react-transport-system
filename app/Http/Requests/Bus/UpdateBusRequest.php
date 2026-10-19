<?php

declare(strict_types=1);

namespace App\Http\Requests\Bus;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBusRequest extends FormRequest
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
        $busId = $this->route('bus')?->id ?? $this->route('bus');

        return [
            'bus_number' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('buses', 'bus_number')->ignore($busId),
            ],
            'plate_number' => ['sometimes', 'required', 'string', 'max:50'],
            'seat_layout_id' => ['sometimes', 'required', 'exists:seat_layouts,id'],
            'model' => ['nullable', 'string', 'max:100'],
            'manufacture_year' => ['nullable', 'integer', 'min:2000', 'max:' . ((int) date('Y') + 1)],
            'amenities' => ['nullable', 'array'],
            'amenities.*' => ['string'],
            'status' => ['sometimes', 'required', 'in:active,maintenance,out_of_service'],
        ];
    }
}
