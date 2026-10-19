<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * تحديد صلاحية المستخدم لتنفيذ هذا الطلب
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * قواعد التحقق من صحة بيانات تسجيل حساب جديد
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:20'],
            'role' => ['nullable', 'in:admin,agent,passenger'],
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
            'name.required' => 'الاسم مطلوب.',
            'name.string' => 'يجب أن يكون الاسم نصاً.',
            'name.max' => 'يجب ألا يتجاوز الاسم 255 حرفاً.',
            'email.required' => 'البريد الإلكتروني مطلوب.',
            'email.email' => 'يجب إدخال بريد إلكتروني صحيح.',
            'email.unique' => 'البريد الإلكتروني مستخدم بالفعل.',
            'password.required' => 'كلمة المرور مطلوبة.',
            'password.string' => 'يجب أن تكون كلمة المرور نصاً.',
            'password.min' => 'كلمة المرور يجب ألا تقل عن 6 أحرف.',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق.',
            'phone.string' => 'يجب أن يكون رقم الهاتف نصاً.',
            'phone.max' => 'يجب ألا يتجاوز رقم الهاتف 20 حرفاً.',
            'role.in' => 'الدور المحدد غير صالح.',
        ];
    }
}
