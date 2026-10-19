<?php

declare(strict_types=1);

namespace App\Http\Requests\Trip;

use Illuminate\Foundation\Http\FormRequest;

class SearchTripsRequest extends FormRequest
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
            'origin_id' => ['required', 'exists:stations,id'],
            'destination_id' => ['required', 'exists:stations,id', 'different:origin_id'],
            'date' => ['nullable', 'date'],
        ];
    }
}
