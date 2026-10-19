<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property string $role
 * @property \Carbon\Carbon|null $created_at
 */
class UserResource extends JsonResource
{
    /**
     * تحويل المورد إلى مصفوفة
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $roleLabels = [
            'admin' => 'مدير النظام',
            'agent' => 'موظف حجز',
            'passenger' => 'عميل',
        ];

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'role_label' => $roleLabels[$this->role] ?? $this->role,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
