<?php

declare(strict_types=1);

namespace App\Http\Requests\Station;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStationRequest extends FormRequest
{
    /**
     * تحديد صلاحية المستخدم لتنفيذ هذا الطلب
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * قواعد التحقق من صحة بيانات تعديل محطة
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name_ar' => ['sometimes', 'required', 'string', 'max:255'],
            'name_en' => ['sometimes', 'required', 'string', 'max:255'],
            'code' => [
                'sometimes',
                'required',
                'string',
                'max:10',
                Rule::unique('stations', 'code')->ignore($this->route('station')),
            ],
            'city' => ['sometimes', 'required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'phone' => ['nullable', 'string', 'max:20'],
            'is_active' => ['nullable', 'boolean'],
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
            'name_ar.required' => 'اسم المحطة باللغة العربية مطلوب.',
            'name_ar.string' => 'يجب أن يكون اسم المحطة بالعربية نصاً.',
            'name_ar.max' => 'يجب ألا يتجاوز اسم المحطة بالعربية 255 حرفاً.',
            'name_en.required' => 'اسم المحطة باللغة الإنجليزية مطلوب.',
            'name_en.string' => 'يجب أن يكون اسم المحطة بالإنجليزية نصاً.',
            'name_en.max' => 'يجب ألا يتجاوز اسم المحطة بالإنجليزية 255 حرفاً.',
            'code.required' => 'رمز المحطة مطلوب.',
            'code.string' => 'يجب أن يكون رمز المحطة نصاً.',
            'code.max' => 'يجب ألا يتجاوز رمز المحطة 10 أحرف.',
            'code.unique' => 'رمز المحطة مستخدم بالفعل.',
            'city.required' => 'اسم المدينة مطلوب.',
            'city.string' => 'يجب أن يكون اسم المدينة نصاً.',
            'city.max' => 'يجب ألا يتجاوز اسم المدينة 255 حرفاً.',
            'address.string' => 'يجب أن يكون العنوان نصاً.',
            'address.max' => 'يجب ألا يتجاوز العنوان 500 حرف.',
            'latitude.numeric' => 'يجب أن يكون خط العرض رقماً.',
            'latitude.between' => 'يجب أن يكون خط العرض بين -90 و 90 درجة.',
            'longitude.numeric' => 'يجب أن يكون خط الطول رقماً.',
            'longitude.between' => 'يجب أن يكون خط الطول بين -180 و 180 درجة.',
            'phone.string' => 'يجب أن يكون رقم الهاتف نصاً.',
            'phone.max' => 'يجب ألا يتجاوز رقم الهاتف 20 حرفاً.',
            'is_active.boolean' => 'حالة التفعيل يجب أن تكون قيمة منطقية.',
        ];
    }
}
