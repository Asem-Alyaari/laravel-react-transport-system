<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\TransportSystemSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserSeeder::class);
        $this->seed(TransportSystemSeeder::class);
    }

    public function test_can_register_new_user(): void
    {
        $payload = [
            'name' => 'سارة مسافرة',
            'email' => 'sara@transport.sa',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'phone' => '0512345678',
            'role' => 'passenger',
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'تم إنشاء الحساب بنجاح')
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'phone',
                        'role',
                        'role_label',
                        'created_at',
                    ],
                    'token',
                ],
            ]);

        $this->assertNotEmpty($response->json('data.token'));
        $this->assertDatabaseHas('users', [
            'email' => 'sara@transport.sa',
            'role' => 'passenger',
        ]);
    }

    public function test_can_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@transport.sa',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'تم تسجيل الدخول بنجاح')
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'role',
                        'role_label',
                    ],
                    'token',
                ],
            ]);

        $this->assertNotEmpty($response->json('data.token'));
    }

    public function test_cannot_login_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@transport.sa',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email'])
            ->assertJsonPath('errors.email.0', 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    public function test_can_get_authenticated_user_profile(): void
    {
        $user = User::where('email', 'admin@transport.sa')->firstOrFail();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.email', 'admin@transport.sa')
            ->assertJsonPath('data.role', 'admin')
            ->assertJsonPath('data.role_label', 'مدير النظام');
    }

    public function test_can_logout(): void
    {
        $user = User::where('email', 'admin@transport.sa')->firstOrFail();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'تم تسجيل الخروج بنجاح');

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);

        $this->app['auth']->forgetGuards();

        // التوكن تم إلغاؤه ولا يمكن استخدامه مجدداً
        $profileResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/me');

        $profileResponse->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $response = $this->getJson('/api/trips');

        $response->assertStatus(401);
    }

    public function test_agent_cannot_access_admin_routes(): void
    {
        $agent = User::where('email', 'agent@transport.sa')->firstOrFail();
        $token = $agent->createToken('agent_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/stations', [
                'name_ar' => 'محطة غير مصرحة',
                'name_en' => 'Unauthorized Station',
                'code' => 'UNAUTH',
                'city' => 'مكة',
            ]);

        $response->assertStatus(403)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'ليس لديك صلاحية للوصول إلى هذا المورد');
    }

    public function test_admin_can_access_admin_routes(): void
    {
        $admin = User::where('email', 'admin@transport.sa')->firstOrFail();
        $token = $admin->createToken('admin_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/stations', [
                'name_ar' => 'محطة أبها الإقليمية',
                'name_en' => 'Abha Regional Station',
                'code' => 'AHB',
                'city' => 'أبها',
                'address' => 'طريق الملك فيصل',
                'latitude' => 18.2164,
                'longitude' => 42.5053,
                'phone' => '0172223344',
                'is_active' => true,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.code', 'AHB')
            ->assertJsonPath('data.name_ar', 'محطة أبها الإقليمية');
    }
}
