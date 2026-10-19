<?php

declare(strict_types=1);

namespace App\Http\Requests\Report;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;

class ReportFilterRequest extends FormRequest
{
    /**
     * تحديد صلاحية المستخدم لتنفيذ هذا الطلب
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * قواعد التحقق من صحة فلاتر التقارير
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'route_id' => ['nullable', 'exists:routes,id'],
            'period' => ['nullable', 'in:today,week,month,year,custom'],
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
            'start_date.date' => 'تاريخ البداية يجب أن يكون تاريخاً صالحاً.',
            'end_date.date' => 'تاريخ النهاية يجب أن يكون تاريخاً صالحاً.',
            'end_date.after_or_equal' => 'تاريخ النهاية يجب أن يكون مساوياً أو لاحقاً لتاريخ البداية.',
            'route_id.exists' => 'مسار الرحلة المحدد غير موجود في النظام.',
            'period.in' => 'الفترة المحددة غير صالحة. الخيارات المتاحة هي: اليوم، الأسبوع، الشهر، السنة، أو مخصص.',
        ];
    }

    /**
     * استخراج نطاق التواريخ استناداً إلى الحقول المباشرة أو الفترة الزمنية المختارة
     *
     * @return array{0: ?string, 1: ?string}
     */
    public function dateRange(): array
    {
        $startDate = $this->validated('start_date');
        $endDate = $this->validated('end_date');
        $period = $this->validated('period');

        if (!$startDate && $period) {
            $now = Carbon::now();
            switch ($period) {
                case 'today':
                    $startDate = $now->toDateString();
                    $endDate = $now->toDateString();
                    break;
                case 'week':
                    $startDate = $now->copy()->subDays(6)->toDateString();
                    $endDate = $now->toDateString();
                    break;
                case 'month':
                    $startDate = $now->copy()->startOfMonth()->toDateString();
                    $endDate = $now->toDateString();
                    break;
                case 'year':
                    $startDate = $now->copy()->startOfYear()->toDateString();
                    $endDate = $now->toDateString();
                    break;
            }
        }

        return [$startDate, $endDate];
    }
}
