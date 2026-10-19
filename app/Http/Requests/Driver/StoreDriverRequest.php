<?php

declare(strict_types=1);

namespace App\Http\Requests\Driver;

use Illuminate\Foundation\Http\FormRequest;

class StoreDriverRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:150'],
            'phone' => ['required', 'string', 'max:20'],
            'license_number' => ['required', 'string', 'max:50', 'unique:drivers,license_number'],
            'license_expiry' => ['nullable', 'date'],
            'status' => ['nullable', 'in:available,on_trip,on_leave,inactive'],
        ];
    }
}
