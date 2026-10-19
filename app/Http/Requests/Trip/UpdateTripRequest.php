<?php

declare(strict_types=1);

namespace App\Http\Requests\Trip;

use App\Models\Trip;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTripRequest extends FormRequest
{
    /**
     * تحديد صلاحية المستخدم لتنفيذ هذا الطلب
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * قواعد التحقق من صحة بيانات تعديل الرحلة
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = [
            'route_id' => ['sometimes', 'required', 'exists:routes,id'],
            'bus_id' => ['sometimes', 'required', 'exists:buses,id'],
            'driver_id' => ['sometimes', 'required', 'exists:drivers,id'],
            'departure_datetime' => ['sometimes', 'required', 'date'],
            'base_fare' => ['sometimes', 'required', 'numeric', 'min:0'],
            'status' => ['sometimes', 'required', 'in:scheduled,boarding,in_transit,completed,cancelled'],
            'remarks' => ['nullable', 'string', 'max:500'],
        ];

        if ($this->has('arrival_datetime')) {
            if ($this->has('departure_datetime')) {
                $rules['arrival_datetime'] = ['sometimes', 'required', 'date', 'after:departure_datetime'];
            } else {
                $trip = $this->route('trip');
                $departure = $trip instanceof Trip ? $trip->departure_datetime : null;
                if ($departure) {
                    $rules['arrival_datetime'] = [
                        'sometimes',
                        'required',
                        'date',
                        'after:' . Carbon::parse($departure)->toDateTimeString(),
                    ];
                } else {
                    $rules['arrival_datetime'] = ['sometimes', 'required', 'date'];
                }
            }
        }

        return $rules;
    }

    /**
     * رسائل الخطأ المخصصة باللغة العربية
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'route_id.required' => 'يرجى تحديد مسار الرحلة.',
            'route_id.exists' => 'مسار الرحلة المحدد غير موجود في النظام.',
            'bus_id.required' => 'يرجى تحديد الحافلة.',
            'bus_id.exists' => 'الحافلة المحددة غير موجودة في النظام.',
            'driver_id.required' => 'يرجى تحديد السائق.',
            'driver_id.exists' => 'السائق المحدد غير موجود في النظام.',
            'departure_datetime.required' => 'يرجى تحديد موعد المغادرة.',
            'departure_datetime.date' => 'صيغة تاريخ موعد المغادرة غير صالحة.',
            'arrival_datetime.required' => 'يرجى تحديد موعد الوصول.',
            'arrival_datetime.date' => 'صيغة تاريخ موعد الوصول غير صالحة.',
            'arrival_datetime.after' => 'يجب أن يكون موعد الوصول بعد موعد المغادرة.',
            'base_fare.required' => 'يرجى تحديد السعر الأساسي للتذكرة.',
            'base_fare.numeric' => 'يجب أن يكون السعر الأساسي رقماً.',
            'base_fare.min' => 'لا يمكن أن يكون السعر الأساسي سالباً.',
            'status.required' => 'يرجى تحديد حالة الرحلة.',
            'status.in' => 'حالة الرحلة المحددة غير صالحة.',
            'remarks.max' => 'يجب ألا تتجاوز الملاحظات 500 حرف.',
        ];
    }
}
