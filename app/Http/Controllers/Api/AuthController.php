<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        protected readonly AuthService $authService
    ) {}

    /**
     * تسجيل مستخدم جديد
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'تم إنشاء الحساب بنجاح',
            'data' => [
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
            ],
        ], 201);
    }

    /**
     * تسجيل الدخول
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'تم تسجيل الدخول بنجاح',
            'data' => [
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
            ],
        ], 200);
    }

    /**
     * تسجيل الخروج
     */
    public function logout(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $this->authService->logout($user);

        return response()->json([
            'status' => 'success',
            'message' => 'تم تسجيل الخروج بنجاح',
        ], 200);
    }

    /**
     * عرض الملف الشخصي للمستخدم الحالي
     */
    public function me(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $profile = $this->authService->getProfile($user);

        return response()->json([
            'status' => 'success',
            'message' => 'تم استرجاع بيانات الملف الشخصي بنجاح',
            'data' => new UserResource($profile),
        ], 200);
    }
}
