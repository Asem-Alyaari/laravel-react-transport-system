<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Station;
use App\Models\User;
use Database\Seeders\TransportSystemSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StationCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserSeeder::class);
        $this->seed(TransportSystemSeeder::class);

        $admin = User::where('role', 'admin')->firstOrFail();
        Sanctum::actingAs($admin, ['*']);
    }

    public function test_can_list_stations_with_counts(): void
    {
        $response = $this->getJson('/api/stations');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => [
                        'id',
                        'name_ar',
                        'name_en',
                        'code',
                        'city',
                        'address',
                        'latitude',
                        'longitude',
                        'phone',
                        'is_active',
                        'origin_routes_count',
                        'destination_routes_count',
                        'route_stops_count',
                    ],
                ],
            ]);

        $this->assertNotEmpty($response->json('data'));
    }

    public function test_can_filter_stations_by_search_and_active_status(): void
    {
        // إنشاء محطة غير نشطة
        Station::create([
            'name_ar' => 'محطة معطلة تجريبية',
            'name_en' => 'Inactive Test Station',
            'code' => 'INA',
            'city' => 'الخرج',
            'is_active' => false,
        ]);

        // بحث بالاسم العربي
        $resName = $this->getJson('/api/stations?search=بريدة');
        $resName->assertStatus(200)
            ->assertJsonPath('data.0.code', 'QAS');

        // بحث بالكود
        $resCode = $this->getJson('/api/stations?search=RUH');
        $resCode->assertStatus(200)
            ->assertJsonPath('data.0.code', 'RUH');

        // تصفية المحطات النشطة فقط
        $resActive = $this->getJson('/api/stations?active_only=1');
        $resActive->assertStatus(200);
        $codes = collect($resActive->json('data'))->pluck('code')->all();
        $this->assertNotContains('INA', $codes);
        $this->assertContains('RUH', $codes);
    }

    public function test_can_create_station(): void
    {
        $payload = [
            'name_ar' => 'محطة الدمام المركزية',
            'name_en' => 'Dammam Central Station',
            'code' => 'DMM',
            'city' => 'الدمام',
            'address' => 'طريق الملك فهد، حي الشاطئ',
            'latitude' => 26.4207,
            'longitude' => 50.0888,
            'phone' => '0138889900',
            'is_active' => true,
        ];

        $response = $this->postJson('/api/stations', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'تم إنشاء المحطة بنجاح')
            ->assertJsonPath('data.code', 'DMM')
            ->assertJsonPath('data.name_ar', 'محطة الدمام المركزية');

        $this->assertDatabaseHas('stations', [
            'code' => 'DMM',
            'city' => 'الدمام',
        ]);
    }

    public function test_can_show_station_details(): void
    {
        $station = Station::where('code', 'RUH')->first();
        $this->assertNotNull($station);

        $response = $this->getJson("/api/stations/{$station->id}");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.id', $station->id)
            ->assertJsonPath('data.code', 'RUH')
            ->assertJsonStructure([
                'status',
                'data' => [
                    'id',
                    'name_ar',
                    'name_en',
                    'code',
                    'city',
                    'origin_routes_count',
                    'destination_routes_count',
                    'route_stops_count',
                ],
            ]);
    }

    public function test_can_update_station(): void
    {
        $station = Station::where('code', 'RUH')->first();
        $this->assertNotNull($station);

        $payload = [
            'name_ar' => 'محطة الرياض المركزية المحدثة',
            'city' => 'الرياض الكبرى',
            'code' => 'RUH', // نفس الكود لا يسبب خطأ التحقق
            'phone' => '0119998877',
        ];

        $response = $this->putJson("/api/stations/{$station->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'تم تحديث بيانات المحطة بنجاح')
            ->assertJsonPath('data.name_ar', 'محطة الرياض المركزية المحدثة')
            ->assertJsonPath('data.city', 'الرياض الكبرى');

        $this->assertDatabaseHas('stations', [
            'id' => $station->id,
            'name_ar' => 'محطة الرياض المركزية المحدثة',
            'city' => 'الرياض الكبرى',
            'phone' => '0119998877',
        ]);
    }

    public function test_cannot_delete_station_with_linked_routes(): void
    {
        $station = Station::where('code', 'RUH')->first();
        $this->assertNotNull($station);

        $response = $this->deleteJson("/api/stations/{$station->id}");

        $response->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'لا يمكن حذف المحطة لأنها مرتبطة بمسارات وخطوط سير قائمة');

        $this->assertDatabaseHas('stations', ['id' => $station->id]);
    }

    public function test_can_delete_unlinked_station(): void
    {
        $station = Station::create([
            'name_ar' => 'محطة منعزلة جديدة',
            'name_en' => 'Isolated Station',
            'code' => 'ISO',
            'city' => 'عرعر',
            'is_active' => true,
        ]);

        $response = $this->deleteJson("/api/stations/{$station->id}");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'تم حذف المحطة بنجاح');

        $this->assertDatabaseMissing('stations', ['id' => $station->id]);
    }

    public function test_validates_station_inputs_with_arabic_messages(): void
    {
        // حقول مطلوبة فارغة
        $response = $this->postJson('/api/stations', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name_ar', 'name_en', 'code', 'city']);

        // كود مكرر
        $duplicateResponse = $this->postJson('/api/stations', [
            'name_ar' => 'محطة مكررة',
            'name_en' => 'Duplicate Station',
            'code' => 'RUH', // موجود مسبقاً
            'city' => 'الرياض',
        ]);

        $duplicateResponse->assertStatus(422)
            ->assertJsonValidationErrors(['code']);
    }
}
