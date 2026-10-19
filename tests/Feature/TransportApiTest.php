<?php

namespace Tests\Feature;

use App\Models\Station;
use App\Models\Trip;
use App\Models\User;
use Database\Seeders\TransportSystemSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TransportApiTest extends TestCase
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

    public function test_can_fetch_stations(): void
    {
        $response = $this->getJson('/api/stations');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => ['id', 'name_ar', 'name_en', 'code', 'city'],
                ],
            ]);
    }

    public function test_can_search_trips_between_stations(): void
    {
        $origin = Station::where('code', 'RUH')->first();
        $destination = Station::where('code', 'MED')->first();

        $this->assertNotNull($origin);
        $this->assertNotNull($destination);

        $response = $this->getJson("/api/trips/search?origin_id={$origin->id}&destination_id={$destination->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => [
                        'id',
                        'trip_code',
                        'route_name',
                        'departure_datetime',
                        'arrival_datetime',
                        'fare',
                        'bus' => [
                            'bus_number',
                            'total_seats',
                            'available_seats',
                        ],
                    ],
                ],
            ]);
    }

    public function test_can_fetch_seat_map_for_trip(): void
    {
        $trip = Trip::first();
        $origin = Station::where('code', 'RUH')->first();
        $destination = Station::where('code', 'MED')->first();

        $this->assertNotNull($trip);

        $response = $this->getJson("/api/trips/{$trip->id}/seat-map?from_station_id={$origin->id}&to_station_id={$destination->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'trip_id',
                    'bus_type',
                    'total_seats',
                    'seats' => [
                        '*' => ['seat_number', 'row', 'col', 'type', 'status'],
                    ],
                ],
            ]);
    }

    public function test_can_create_booking_and_issue_tickets(): void
    {
        $trip = Trip::first();
        $origin = Station::where('code', 'RUH')->first();
        $destination = Station::where('code', 'MED')->first();

        $payload = [
            'trip_id' => $trip->id,
            'from_station_id' => $origin->id,
            'to_station_id' => $destination->id,
            'customer_name' => 'فهد الأحمد',
            'customer_phone' => '0509998877',
            'customer_email' => 'fahad@example.com',
            'payment_method' => 'cash',
            'passengers' => [
                [
                    'name' => 'فهد الأحمد',
                    'national_id' => '1029384756',
                    'gender' => 'male',
                    'passenger_type' => 'adult',
                    'seat_number' => '1',
                ],
            ],
        ];

        $response = $this->postJson('/api/bookings', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'booking_reference',
                    'trip_code',
                    'customer_name',
                    'total_passengers',
                    'total_amount',
                    'tickets' => [
                        '*' => ['ticket_number', 'seat_number', 'fare', 'qr_code_hash'],
                    ],
                ],
            ]);

        $this->assertDatabaseHas('bookings', [
            'customer_name' => 'فهد الأحمد',
            'customer_phone' => '0509998877',
        ]);

        $this->assertDatabaseHas('tickets', [
            'seat_number' => '1',
            'trip_id' => $trip->id,
        ]);
    }

    public function test_can_manage_drivers_crud(): void
    {
        // 1. Create
        $payload = [
            'name' => 'سالم الدوسري',
            'phone' => '0551122334',
            'license_number' => 'DL-998877',
            'status' => 'available',
        ];

        $createRes = $this->postJson('/api/drivers', $payload);
        $createRes->assertStatus(201);
        $driverId = $createRes->json('data.id');

        // 2. Read
        $getRes = $this->getJson('/api/drivers');
        $getRes->assertStatus(200);

        // 3. Update
        $updateRes = $this->putJson("/api/drivers/{$driverId}", [
            'name' => 'سالم محمد الدوسري',
            'status' => 'on_trip',
        ]);
        $updateRes->assertStatus(200)
            ->assertJsonPath('data.name', 'سالم محمد الدوسري')
            ->assertJsonPath('data.status', 'on_trip');

        // 4. Delete
        $deleteRes = $this->deleteJson("/api/drivers/{$driverId}");
        $deleteRes->assertStatus(200);
        $this->assertDatabaseMissing('drivers', ['id' => $driverId]);
    }

    public function test_can_manage_buses_crud(): void
    {
        $layout = \App\Models\SeatLayout::first();
        $this->assertNotNull($layout);

        // 1. Create
        $payload = [
            'bus_number' => 'BUS-TEST-99',
            'plate_number' => 'ر س م 9999',
            'seat_layout_id' => $layout->id,
            'model' => 'Volvo 9700',
            'manufacture_year' => 2023,
            'amenities' => ['wifi', 'toilet'],
            'status' => 'active',
        ];

        $createRes = $this->postJson('/api/buses', $payload);
        $createRes->assertStatus(201);
        $busId = $createRes->json('data.id');

        // 2. Read
        $getRes = $this->getJson('/api/buses');
        $getRes->assertStatus(200);

        // 3. Update
        $updateRes = $this->putJson("/api/buses/{$busId}", [
            'status' => 'maintenance',
        ]);
        $updateRes->assertStatus(200)
            ->assertJsonPath('data.status', 'maintenance');

        // 4. Delete
        $deleteRes = $this->deleteJson("/api/buses/{$busId}");
        $deleteRes->assertStatus(200);
        $this->assertDatabaseMissing('buses', ['id' => $busId]);
    }
}
