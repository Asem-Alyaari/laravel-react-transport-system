<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Route;
use App\Models\RouteStop;
use App\Models\SegmentFare;
use App\Models\Station;
use App\Models\User;
use Database\Seeders\TransportSystemSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RouteCrudTest extends TestCase
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

    public function test_can_list_routes_with_filtering(): void
    {
        $response = $this->getJson('/api/routes');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'origin_station' => ['id', 'name', 'city_name'],
                        'destination_station' => ['id', 'name', 'city_name'],
                        'distance_km',
                        'estimated_duration_minutes',
                        'is_active',
                        'stops_count',
                        'trips_count',
                    ],
                ],
            ]);

        // بحث باسم المسار
        $resName = $this->getJson('/api/routes?search=المدينة');
        $resName->assertStatus(200)
            ->assertJsonPath('status', 'success');
        $this->assertNotEmpty($resName->json('data'));

        // بحث باسم مدينة المحطة
        $resCity = $this->getJson('/api/routes?search=بريدة');
        $resCity->assertStatus(200);

        // تصفية حسب حالة التفعيل
        $resActive = $this->getJson('/api/routes?active_only=1');
        $resActive->assertStatus(200);
    }

    public function test_can_create_route_with_stops_and_fares(): void
    {
        $origin = Station::where('code', 'RUH')->first();
        $mid = Station::where('code', 'QAS')->first();
        $dest = Station::where('code', 'JED')->first();

        $this->assertNotNull($origin);
        $this->assertNotNull($mid);
        $this->assertNotNull($dest);

        $payload = [
            'name' => 'الرياض ⬅️ جدة السريع',
            'origin_station_id' => $origin->id,
            'destination_station_id' => $dest->id,
            'distance_km' => 950.50,
            'estimated_duration_minutes' => 600,
            'is_active' => true,
            // تم تمرير المحطة البينية فقط، يجب على النظام إضافة محطة البداية والنهاية تلقائياً
            'stops' => [
                [
                    'station_id' => $mid->id,
                    'stop_order' => 2,
                    'distance_from_origin_km' => 350.00,
                    'duration_from_origin_minutes' => 210,
                    'dwell_time_minutes' => 20,
                ],
            ],
            'segment_fares' => [
                [
                    'from_station_id' => $origin->id,
                    'to_station_id' => $mid->id,
                    'fare' => 85.00,
                    'vip_fare' => 110.00,
                    'child_fare' => 50.00,
                ],
                [
                    'from_station_id' => $origin->id,
                    'to_station_id' => $dest->id,
                    'fare' => 220.00,
                    'vip_fare' => 290.00,
                    'child_fare' => 120.00,
                ],
            ],
        ];

        $response = $this->postJson('/api/routes', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'تم إنشاء المسار بنجاح')
            ->assertJsonPath('data.name', 'الرياض ⬅️ جدة السريع')
            ->assertJsonPath('data.distance_km', 950.5);

        $routeId = $response->json('data.id');

        $this->assertDatabaseHas('routes', [
            'id' => $routeId,
            'name' => 'الرياض ⬅️ جدة السريع',
            'origin_station_id' => $origin->id,
            'destination_station_id' => $dest->id,
        ]);

        // التحقق من إنشاء 3 محطات توقف (البداية 1، البينية 2، النهاية 3)
        $stops = RouteStop::where('route_id', $routeId)->orderBy('stop_order')->get();
        $this->assertCount(3, $stops);

        $this->assertEquals($origin->id, $stops[0]->station_id);
        $this->assertEquals(1, $stops[0]->stop_order);

        $this->assertEquals($mid->id, $stops[1]->station_id);
        $this->assertEquals(2, $stops[1]->stop_order);

        $this->assertEquals($dest->id, $stops[2]->station_id);
        $this->assertEquals(3, $stops[2]->stop_order);

        // التحقق من أسعار المقاطع
        $this->assertDatabaseHas('segment_fares', [
            'route_id' => $routeId,
            'from_station_id' => $origin->id,
            'to_station_id' => $mid->id,
            'fare' => 85.00,
        ]);
        $this->assertDatabaseHas('segment_fares', [
            'route_id' => $routeId,
            'from_station_id' => $origin->id,
            'to_station_id' => $dest->id,
            'fare' => 220.00,
        ]);
    }

    public function test_can_show_route_with_stops_and_fares(): void
    {
        $route = Route::first();
        $this->assertNotNull($route);

        $response = $this->getJson("/api/routes/{$route->id}");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.id', $route->id)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'id',
                    'name',
                    'origin_station',
                    'destination_station',
                    'distance_km',
                    'estimated_duration_minutes',
                    'is_active',
                    'stops_count',
                    'trips_count',
                    'stops' => [
                        '*' => [
                            'id',
                            'station_id',
                            'stop_order',
                            'distance_from_origin_km',
                            'duration_from_origin_minutes',
                            'dwell_time_minutes',
                            'station' => ['id', 'name_ar', 'name_en', 'code', 'city'],
                        ],
                    ],
                    'segment_fares' => [
                        '*' => [
                            'id',
                            'from_station_id',
                            'to_station_id',
                            'fare',
                            'vip_fare',
                            'from_station',
                            'to_station',
                        ],
                    ],
                ],
            ]);
    }

    public function test_can_update_route_and_sync_stops_and_fares(): void
    {
        $route = Route::first();
        $this->assertNotNull($route);

        $hail = Station::where('code', 'HAI')->first();

        $payload = [
            'name' => 'الرياض ⬅️ المدينة المنورة المباشر',
            'distance_km' => 830.00,
            'estimated_duration_minutes' => 500,
            // تحديث المحطات البينية لتكون فقط محطة حائل
            'stops' => [
                [
                    'station_id' => $hail->id,
                    'stop_order' => 2,
                    'distance_from_origin_km' => 580.00,
                    'duration_from_origin_minutes' => 350,
                    'dwell_time_minutes' => 15,
                ],
            ],
            // تحديث أسعار المقاطع
            'segment_fares' => [
                [
                    'from_station_id' => $route->origin_station_id,
                    'to_station_id' => $route->destination_station_id,
                    'fare' => 180.00,
                    'vip_fare' => 230.00,
                ],
            ],
        ];

        $response = $this->putJson("/api/routes/{$route->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'تم تحديث بيانات المسار بنجاح')
            ->assertJsonPath('data.name', 'الرياض ⬅️ المدينة المنورة المباشر')
            ->assertJsonPath('data.distance_km', 830);

        $this->assertDatabaseHas('routes', [
            'id' => $route->id,
            'name' => 'الرياض ⬅️ المدينة المنورة المباشر',
            'distance_km' => 830.00,
        ]);

        // التأكد من استبدال المحطات القديمة بالمحطات الجديدة
        $stops = RouteStop::where('route_id', $route->id)->orderBy('stop_order')->get();
        $this->assertCount(3, $stops); // origin, hail, destination

        $this->assertEquals($hail->id, $stops[1]->station_id);

        // التأكد من تحديث أسعار المقاطع
        $fares = SegmentFare::where('route_id', $route->id)->get();
        $this->assertCount(1, $fares);
        $this->assertEquals(180.00, $fares[0]->fare);
    }

    public function test_cannot_delete_route_with_trips(): void
    {
        $route = Route::first();
        $this->assertNotNull($route);
        $this->assertGreaterThan(0, $route->trips()->count());

        $response = $this->deleteJson("/api/routes/{$route->id}");

        $response->assertStatus(422)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'لا يمكن حذف المسار لأنه يحتوي على رحلات مجدولة');

        $this->assertDatabaseHas('routes', ['id' => $route->id]);
    }

    public function test_can_delete_route_without_trips(): void
    {
        $origin = Station::where('code', 'RUH')->first();
        $dest = Station::where('code', 'JED')->first();

        $route = Route::create([
            'name' => 'مسار مؤقت للحذف',
            'origin_station_id' => $origin->id,
            'destination_station_id' => $dest->id,
            'distance_km' => 900.00,
            'estimated_duration_minutes' => 540,
            'is_active' => true,
        ]);

        RouteStop::create([
            'route_id' => $route->id,
            'station_id' => $origin->id,
            'stop_order' => 1,
            'distance_from_origin_km' => 0,
            'duration_from_origin_minutes' => 0,
            'dwell_time_minutes' => 0,
        ]);

        SegmentFare::create([
            'route_id' => $route->id,
            'from_station_id' => $origin->id,
            'to_station_id' => $dest->id,
            'fare' => 150.00,
        ]);

        $response = $this->deleteJson("/api/routes/{$route->id}");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'تم حذف المسار بنجاح');

        $this->assertDatabaseMissing('routes', ['id' => $route->id]);
        $this->assertDatabaseMissing('route_stops', ['route_id' => $route->id]);
        $this->assertDatabaseMissing('segment_fares', ['route_id' => $route->id]);
    }

    public function test_validates_route_inputs_with_arabic_messages(): void
    {
        $response = $this->postJson('/api/routes', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'name',
                'origin_station_id',
                'destination_station_id',
                'distance_km',
                'estimated_duration_minutes',
            ]);

        // التحقق من خطأ تطابق محطة الانطلاق والوصول
        $station = Station::first();
        $sameStationResponse = $this->postJson('/api/routes', [
            'name' => 'مسار خاطئ',
            'origin_station_id' => $station->id,
            'destination_station_id' => $station->id,
            'distance_km' => 100,
            'estimated_duration_minutes' => 60,
        ]);

        $sameStationResponse->assertStatus(422)
            ->assertJsonValidationErrors(['origin_station_id']);
    }
}
