<?php

declare(strict_types=1);

namespace App\Http\Requests\Route;

use Illuminate\Foundation\Http\FormRequest;

class StoreRouteRequest extends FormRequest
{
    /**
     * تحديد صلاحية المستخدم لتنفيذ هذا الطلب
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * قواعد التحقق من صحة بيانات إضافة مسار
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'origin_station_id' => ['required', 'exists:stations,id', 'different:destination_station_id'],
            'destination_station_id' => ['required', 'exists:stations,id'],
            'distance_km' => ['required', 'numeric', 'min:0'],
            'estimated_duration_minutes' => ['required', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],

            'stops' => ['nullable', 'array'],
            'stops.*.station_id' => ['required_with:stops', 'exists:stations,id'],
            'stops.*.stop_order' => ['required_with:stops', 'integer', 'min:1'],
            'stops.*.distance_from_origin_km' => ['nullable', 'numeric', 'min:0'],
            'stops.*.duration_from_origin_minutes' => ['nullable', 'integer', 'min:0'],
            'stops.*.dwell_time_minutes' => ['nullable', 'integer', 'min:0'],

            'segment_fares' => ['nullable', 'array'],
            'segment_fares.*.from_station_id' => ['required_with:segment_fares', 'exists:stations,id'],
            'segment_fares.*.to_station_id' => ['required_with:segment_fares', 'exists:stations,id'],
            'segment_fares.*.fare' => ['required_with:segment_fares', 'numeric', 'min:0'],
            'segment_fares.*.vip_fare' => ['nullable', 'numeric', 'min:0'],
            'segment_fares.*.child_fare' => ['nullable', 'numeric', 'min:0'],
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
            'name.required' => 'اسم المسار مطلوب.',
            'name.string' => 'يجب أن يكون اسم المسار نصاً.',
            'name.max' => 'يجب ألا يتجاوز اسم المسار 255 حرفاً.',
            'origin_station_id.required' => 'محطة الانطلاق مطلوبة.',
            'origin_station_id.exists' => 'محطة الانطلاق المحددة غير موجودة.',
            'origin_station_id.different' => 'يجب أن تكون محطة الانطلاق مختلفة عن محطة الوصول.',
            'destination_station_id.required' => 'محطة الوصول مطلوبة.',
            'destination_station_id.exists' => 'محطة الوصول المحددة غير موجودة.',
            'distance_km.required' => 'المسافة بالكيلومتر مطلوبة.',
            'distance_km.numeric' => 'يجب أن تكون المسافة رقماً.',
            'distance_km.min' => 'لا يمكن أن تكون المسافة سالبة.',
            'estimated_duration_minutes.required' => 'المدة المتوقعة بالدقائق مطلوبة.',
            'estimated_duration_minutes.integer' => 'يجب أن تكون المدة المتوقعة عدداً صحيحاً.',
            'estimated_duration_minutes.min' => 'يجب أن تكون المدة المتوقعة دقيقة واحدة على الأقل.',
            'is_active.boolean' => 'حالة التفعيل يجب أن تكون قيمة منطقية.',
            'stops.array' => 'يجب أن تكون المحطات البينية مصفوفة.',
            'stops.*.station_id.required_with' => 'معرف المحطة مطلوب لكل توقف.',
            'stops.*.station_id.exists' => 'المحطة المحددة في التوقفات غير موجودة.',
            'stops.*.stop_order.required_with' => 'ترتيب التوقف مطلوب.',
            'stops.*.stop_order.integer' => 'ترتيب التوقف يجب أن يكون رقماً صحيحاً.',
            'stops.*.stop_order.min' => 'ترتيب التوقف يجب أن يبدأ من 1.',
            'stops.*.distance_from_origin_km.numeric' => 'المسافة من محطة الانطلاق يجب أن تكون رقماً.',
            'stops.*.distance_from_origin_km.min' => 'لا يمكن أن تكون المسافة من محطة الانطلاق سالبة.',
            'stops.*.duration_from_origin_minutes.integer' => 'المدة من محطة الانطلاق يجب أن تكون عدداً صحيحاً.',
            'stops.*.duration_from_origin_minutes.min' => 'لا يمكن أن تكون المدة سالبة.',
            'stops.*.dwell_time_minutes.integer' => 'مدة التوقف بالمحطة يجب أن تكون عدداً صحيحاً.',
            'stops.*.dwell_time_minutes.min' => 'لا يمكن أن تكون مدة التوقف سالبة.',
            'segment_fares.array' => 'يجب أن تكون أسعار المقاطع مصفوفة.',
            'segment_fares.*.from_station_id.required_with' => 'محطة بداية المقطع مطلوبة.',
            'segment_fares.*.from_station_id.exists' => 'محطة بداية المقطع غير موجودة.',
            'segment_fares.*.to_station_id.required_with' => 'محطة نهاية المقطع مطلوبة.',
            'segment_fares.*.to_station_id.exists' => 'محطة نهاية المقطع غير موجودة.',
            'segment_fares.*.fare.required_with' => 'سعر المقطع مطلوب.',
            'segment_fares.*.fare.numeric' => 'سعر المقطع يجب أن يكون رقماً.',
            'segment_fares.*.fare.min' => 'لا يمكن أن يكون سعر المقطع سالباً.',
            'segment_fares.*.vip_fare.numeric' => 'سعر تذكرة VIP يجب أن يكون رقماً.',
            'segment_fares.*.vip_fare.min' => 'لا يمكن أن يكون سعر تذكرة VIP سالباً.',
            'segment_fares.*.child_fare.numeric' => 'سعر تذكرة الأطفال يجب أن يكون رقماً.',
            'segment_fares.*.child_fare.min' => 'لا يمكن أن يكون سعر تذكرة الأطفال سالباً.',
        ];
    }
}
