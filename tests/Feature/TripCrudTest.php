<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Bus;
use App\Models\Driver;
use App\Models\Route;
use App\Models\Station;
use App\Models\Trip;
use App\Models\TripStop;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\TransportSystemSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TripCrudTest extends TestCase
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

    public function test_can_list_active_routes_for_dropdown(): void
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
    }

    public function test_can_list_trips_with_filtering(): void
    {
        $route = Route::first();
        $this->assertNotNull($route);

        $response = $this->getJson('/api/trips');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => [
                        'id',
                        'trip_code',
                        'route' => ['id', 'name'],
                        'bus' => ['id', 'bus_number'],
                        'driver' => ['id', 'name'],
                        'departure_datetime',
                        'arrival_datetime',
                        'base_fare',
                        'status',
                        'remarks',
                        'bookings_count',
                        'stops',
                        'created_at',
                    ],
                ],
            ]);

        // تصفية حسب الحالة
        $filterStatusRes = $this->getJson('/api/trips?status=scheduled');
        $filterStatusRes->assertStatus(200);

        // تصفية حسب المسار
        $filterRouteRes = $this->getJson("/api/trips?route_id={$route->id}");
        $filterRouteRes->assertStatus(200);

        // تصفية بالبحث عن كود الرحلة
        $existingTrip = Trip::first();
        $searchRes = $this->getJson("/api/trips?search={$existingTrip->trip_code}");
        $searchRes->assertStatus(200)
            ->assertJsonPath('data.0.id', $existingTrip->id);
    }

    public function test_can_create_trip_and_auto_create_trip_stops(): void
    {
        $route = Route::with('stops')->first();
        $bus = Bus::first();
        $driver = Driver::first();

        $depTime = Carbon::now()->addDays(2)->setHour(9)->setMinute(0)->setSecond(0);
        $arrTime = (clone $depTime)->addMinutes(540);

        $payload = [
            'route_id' => $route->id,
            'bus_id' => $bus->id,
            'driver_id' => $driver->id,
            'departure_datetime' => $depTime->toDateTimeString(),
            'arrival_datetime' => $arrTime->toDateTimeString(),
            'base_fare' => 199.50,
            'status' => 'scheduled',
            'remarks' => 'رحلة تجريبية جديدة عبر النظام',
        ];

        $response = $this->postJson('/api/trips', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'تم إنشاء الرحلة بنجاح')
            ->assertJsonPath('data.base_fare', 199.5)
            ->assertJsonPath('data.remarks', 'رحلة تجريبية جديدة عبر النظام');

        $tripId = $response->json('data.id');
        $tripCode = $response->json('data.trip_code');

        $this->assertNotEmpty($tripCode);
        $this->assertStringStartsWith('TRP-', $tripCode);

        // التأكد من حفظ الرحلة في قاعدة البيانات
        $this->assertDatabaseHas('trips', [
            'id' => $tripId,
            'route_id' => $route->id,
            'bus_id' => $bus->id,
            'driver_id' => $driver->id,
            'base_fare' => 199.50,
        ]);

        // التأكد من إنشاء محطات الرحلة (TripStops) تلقائياً
        $tripStops = TripStop::where('trip_id', $tripId)->orderBy('stop_order')->get();
        $this->assertCount($route->stops->count(), $tripStops);

        // التحقق من صحة توقيت أول وآخر محطة
        $firstStop = $tripStops->first();
        $lastStop = $tripStops->last();

        $this->assertEquals($depTime->toDateTimeString(), $firstStop->scheduled_departure->toDateTimeString());
        $this->assertEquals($arrTime->toDateTimeString(), $lastStop->scheduled_arrival->toDateTimeString());
    }

    public function test_can_show_trip_details(): void
    {
        $trip = Trip::first();
        $this->assertNotNull($trip);

        $response = $this->getJson("/api/trips/{$trip->id}");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.id', $trip->id)
            ->assertJsonPath('data.trip_code', $trip->trip_code)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'id',
                    'trip_code',
                    'route',
                    'bus',
                    'driver',
                    'departure_datetime',
                    'arrival_datetime',
                    'base_fare',
                    'status',
                    'remarks',
                    'bookings_count',
                    'stops' => [
                        '*' => [
                            'id',
                            'station_id',
                            'station_name',
                            'stop_order',
                            'scheduled_arrival',
                            'scheduled_departure',
                            'status',
                        ],
                    ],
                    'created_at',
                ],
            ]);
    }

    public function test_can_update_trip(): void
    {
        $trip = Trip::first();
        $this->assertNotNull($trip);

        $newDep = Carbon::now()->addDays(5)->setHour(10)->setMinute(0)->setSecond(0);
        $newArr = (clone $newDep)->addHours(8);

        $payload = [
            'base_fare' => 220.00,
            'status' => 'boarding',
            'remarks' => 'تم تعديل السعر وموعد الانطلاق',
            'departure_datetime' => $newDep->toDateTimeString(),
            'arrival_datetime' => $newArr->toDateTimeString(),
        ];

        $response = $this->putJson("/api/trips/{$trip->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'تم تحديث بيانات الرحلة بنجاح')
            ->assertJsonPath('data.base_fare', 220)
            ->assertJsonPath('data.status', 'boarding')
            ->assertJsonPath('data.remarks', 'تم تعديل السعر وموعد الانطلاق');

        $this->assertDatabaseHas('trips', [
            'id' => $trip->id,
            'base_fare' => 220.00,
            'status' => 'boarding',
        ]);
    }

    public function test_cannot_delete_trip_with_confirmed_bookings(): void
    {
        $trip = Trip::first();
        $this->assertNotNull($trip);

        // إنشاء حجز مؤكد للرحلة
        Booking::create([
            'booking_reference' => 'PNR-TEST-999',
            'trip_id' => $trip->id,
            'customer_name' => 'محمد سعيد',
            'customer_phone' => '0501234567',
            'total_passengers' => 1,
            'subtotal_amount' => 175.00,
            'tax_amount' => 0.00,
            'discount_amount' => 0.00,
            'total_amount' => 175.00,
            'payment_method' => 'cash',
            'payment_status' => 'paid',
            'booking_status' => 'confirmed',
        ]);

        $response = $this->deleteJson("/api/trips/{$trip->id}");

        $response->assertStatus(422)
            ->assertJsonPath('status', 'error');

        $this->assertDatabaseHas('trips', ['id' => $trip->id]);
    }

    public function test_can_delete_trip_without_confirmed_bookings(): void
    {
        // إنشاء رحلة جديدة بدون حجوزات
        $route = Route::first();
        $bus = Bus::first();
        $driver = Driver::first();

        $depTime = Carbon::now()->addDays(3)->setHour(7)->setMinute(0);
        $arrTime = (clone $depTime)->addHours(6);

        $trip = Trip::create([
            'trip_code' => 'TRP-DEL-001',
            'route_id' => $route->id,
            'bus_id' => $bus->id,
            'driver_id' => $driver->id,
            'departure_datetime' => $depTime,
            'arrival_datetime' => $arrTime,
            'base_fare' => 150.00,
            'status' => 'scheduled',
        ]);

        TripStop::create([
            'trip_id' => $trip->id,
            'station_id' => $route->origin_station_id,
            'stop_order' => 1,
            'scheduled_arrival' => $depTime,
            'scheduled_departure' => $depTime,
            'status' => 'pending',
        ]);

        $response = $this->deleteJson("/api/trips/{$trip->id}");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'تم حذف الرحلة بنجاح');

        $this->assertDatabaseMissing('trips', ['id' => $trip->id]);
        $this->assertDatabaseMissing('trip_stops', ['trip_id' => $trip->id]);
    }

    public function test_validates_store_trip_inputs_with_arabic_messages(): void
    {
        $response = $this->postJson('/api/trips', [
            'route_id' => 99999, // غير موجود
            'departure_datetime' => Carbon::yesterday()->toDateTimeString(), // في الماضي
            'arrival_datetime' => Carbon::now()->subDays(2)->toDateTimeString(),
            'base_fare' => -50, // سالب
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['route_id', 'bus_id', 'driver_id', 'departure_datetime', 'base_fare']);
    }

    public function test_existing_search_and_seat_map_routes_still_work(): void
    {
        $origin = Station::where('code', 'RUH')->first();
        $destination = Station::where('code', 'MED')->first();
        $trip = Trip::first();

        $searchRes = $this->getJson("/api/trips/search?origin_id={$origin->id}&destination_id={$destination->id}");
        $searchRes->assertStatus(200);

        $seatMapRes = $this->getJson("/api/trips/{$trip->id}/seat-map?from_station_id={$origin->id}&to_station_id={$destination->id}");
        $seatMapRes->assertStatus(200);
    }
}
