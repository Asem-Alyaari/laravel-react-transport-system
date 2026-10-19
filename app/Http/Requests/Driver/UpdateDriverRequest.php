<?php

declare(strict_types=1);

namespace App\Http\Requests\Driver;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDriverRequest extends FormRequest
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
        $driverId = $this->route('driver')?->id ?? $this->route('driver');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'phone' => ['sometimes', 'required', 'string', 'max:20'],
            'license_number' => [
                'sometimes',
                'required',
                'string',
                'max:50',
                Rule::unique('drivers', 'license_number')->ignore($driverId),
            ],
            'license_expiry' => ['nullable', 'date'],
            'status' => ['sometimes', 'required', 'in:available,on_trip,on_leave,inactive'],
        ];
    }
}
