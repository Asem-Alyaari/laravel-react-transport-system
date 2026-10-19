<?php

declare(strict_types=1);

namespace App\Http\Requests\Trip;

use Illuminate\Foundation\Http\FormRequest;

class StoreTripRequest extends FormRequest
{
    /**
     * تحديد صلاحية المستخدم لتنفيذ هذا الطلب
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * قواعد التحقق من صحة بيانات إضافة الرحلة
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'route_id' => ['required', 'exists:routes,id'],
            'bus_id' => ['required', 'exists:buses,id'],
            'driver_id' => ['required', 'exists:drivers,id'],
            'departure_datetime' => ['required', 'date', 'after_or_equal:now'],
            'arrival_datetime' => ['required', 'date', 'after:departure_datetime'],
            'base_fare' => ['required', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:scheduled,boarding,in_transit,completed,cancelled'],
            'remarks' => ['nullable', 'string', 'max:500'],
        ];
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
            'departure_datetime.after_or_equal' => 'يجب أن يكون موعد المغادرة في الوقت الحالي أو في المستقبل.',
            'arrival_datetime.required' => 'يرجى تحديد موعد الوصول.',
            'arrival_datetime.date' => 'صيغة تاريخ موعد الوصول غير صالحة.',
            'arrival_datetime.after' => 'يجب أن يكون موعد الوصول بعد موعد المغادرة.',
            'base_fare.required' => 'يرجى تحديد السعر الأساسي للتذكرة.',
            'base_fare.numeric' => 'يجب أن يكون السعر الأساسي رقماً.',
            'base_fare.min' => 'لا يمكن أن يكون السعر الأساسي سالباً.',
            'status.in' => 'حالة الرحلة المحددة غير صالحة.',
            'remarks.max' => 'يجب ألا تتجاوز الملاحظات 500 حرف.',
        ];
    }
}
