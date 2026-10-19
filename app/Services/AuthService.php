<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * تسجيل مستخدم جديد وإنشاء توكن مصادقة
     *
     * @param array<string, mixed> $data
     * @return array{user: User, token: string}
     */
    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make((string) $data['password']),
            'phone' => $data['phone'] ?? null,
            'role' => $data['role'] ?? 'passenger',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * تسجيل الدخول والتحقق من صحة البيانات
     *
     * @param array<string, mixed> $credentials
     * @return array{user: User, token: string}
     *
     * @throws ValidationException
     */
    public function login(array $credentials): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check((string) $credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['البريد الإلكتروني أو كلمة المرور غير صحيحة'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * تسجيل الخروج وإلغاء توكن الوصول الحالي
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }

    /**
     * جلب بيانات الملف الشخصي المحدثة
     */
    public function getProfile(User $user): User
    {
        return $user->fresh() ?? $user;
    }
}
