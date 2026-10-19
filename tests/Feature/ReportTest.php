<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingPassenger;
use App\Models\Route;
use App\Models\Ticket;
use App\Models\Trip;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\TransportSystemSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(UserSeeder::class);
        $this->seed(TransportSystemSeeder::class);
    }

    public function test_unauthenticated_user_cannot_access_reports_summary(): void
    {
        $response = $this->getJson('/api/reports/summary');

        $response->assertStatus(401);
    }

    public function test_passenger_gets_403_forbidden_on_reports_summary(): void
    {
        $passenger = User::where('role', 'passenger')->firstOrFail();
        Sanctum::actingAs($passenger, ['*']);

        $response = $this->getJson('/api/reports/summary');

        $response->assertStatus(403);
    }

    public function test_admin_can_access_reports_summary(): void
    {
        $admin = User::where('role', 'admin')->firstOrFail();
        Sanctum::actingAs($admin, ['*']);

        $response = $this->getJson('/api/reports/summary');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    'total_revenue',
                    'today_revenue',
                    'total_bookings',
                    'total_tickets',
                    'total_passengers',
                    'average_ticket_fare',
                    'average_occupancy_rate',
                    'completed_trips',
                    'scheduled_trips',
                    'active_buses',
                    'payment_methods_breakdown',
                ],
            ]);
    }

    public function test_agent_can_access_reports_summary(): void
    {
        $agent = User::where('role', 'agent')->firstOrFail();
        Sanctum::actingAs($agent, ['*']);

        $response = $this->getJson('/api/reports/summary');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    'total_revenue',
                    'today_revenue',
                    'total_bookings',
                    'total_tickets',
                    'total_passengers',
                    'average_ticket_fare',
                    'average_occupancy_rate',
                    'completed_trips',
                    'scheduled_trips',
                    'active_buses',
                    'payment_methods_breakdown',
                ],
            ]);
    }

    public function test_can_filter_summary_by_date_and_route(): void
    {
        $admin = User::where('role', 'admin')->firstOrFail();
        Sanctum::actingAs($admin, ['*']);

        $route = Route::firstOrFail();
        $startDate = Carbon::today()->subDays(5)->toDateString();
        $endDate = Carbon::today()->toDateString();

        $response = $this->getJson("/api/reports/summary?start_date={$startDate}&end_date={$endDate}&route_id={$route->id}&period=custom");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    'total_revenue',
                    'today_revenue',
                    'total_bookings',
                    'total_tickets',
                    'total_passengers',
                    'average_ticket_fare',
                    'average_occupancy_rate',
                    'completed_trips',
                    'scheduled_trips',
                    'active_buses',
                    'payment_methods_breakdown',
                ],
            ]);
    }

    public function test_revenue_chart_returns_array_of_daily_points(): void
    {
        $admin = User::where('role', 'admin')->firstOrFail();
        Sanctum::actingAs($admin, ['*']);

        $response = $this->getJson('/api/reports/revenue-chart');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => [
                        'date',
                        'date_label',
                        'revenue',
                        'bookings_count',
                        'tickets_count',
                    ],
                ],
            ]);

        // الافتراضي هو آخر 14 يوماً
        $this->assertCount(14, $response->json('data'));
    }

    public function test_revenue_chart_with_custom_date_range(): void
    {
        $admin = User::where('role', 'admin')->firstOrFail();
        Sanctum::actingAs($admin, ['*']);

        $startDate = Carbon::today()->subDays(6)->toDateString();
        $endDate = Carbon::today()->toDateString();

        $response = $this->getJson("/api/reports/revenue-chart?start_date={$startDate}&end_date={$endDate}");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertCount(7, $response->json('data'));
    }

    public function test_routes_performance_returns_routes_data(): void
    {
        $admin = User::where('role', 'admin')->firstOrFail();
        Sanctum::actingAs($admin, ['*']);

        $response = $this->getJson('/api/reports/routes-performance');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => [
                        'route_id',
                        'route_name',
                        'origin_city',
                        'destination_city',
                        'trips_count',
                        'passengers_count',
                        'total_revenue',
                        'average_occupancy_rate',
                    ],
                ],
            ]);
    }

    public function test_trip_manifest_returns_passenger_manifest(): void
    {
        $admin = User::where('role', 'admin')->firstOrFail();
        Sanctum::actingAs($admin, ['*']);

        $trip = Trip::with(['route', 'bus'])->firstOrFail();

        // إنشاء حجز وتذكرة للرحلة
        $booking = Booking::create([
            'booking_reference' => 'PNR-MANIFEST-1',
            'trip_id' => $trip->id,
            'customer_name' => 'سارة العتيبي',
            'customer_phone' => '0544332211',
            'total_passengers' => 1,
            'subtotal_amount' => 175.00,
            'tax_amount' => 0.00,
            'discount_amount' => 0.00,
            'total_amount' => 175.00,
            'payment_method' => 'card',
            'payment_status' => 'paid',
            'booking_status' => 'confirmed',
        ]);

        $passenger = BookingPassenger::create([
            'booking_id' => $booking->id,
            'name' => 'سارة العتيبي',
            'national_id' => '1099887766',
            'gender' => 'female',
            'passenger_type' => 'adult',
            'phone' => '0544332211',
        ]);

        Ticket::create([
            'ticket_number' => 'TCK-MNF-001',
            'booking_id' => $booking->id,
            'booking_passenger_id' => $passenger->id,
            'trip_id' => $trip->id,
            'seat_number' => '1',
            'from_station_id' => $trip->route->origin_station_id,
            'to_station_id' => $trip->route->destination_station_id,
            'from_stop_order' => 1,
            'to_stop_order' => 4,
            'fare' => 175.00,
            'qr_code_hash' => 'hash-test-mnf-1',
            'status' => 'valid',
        ]);

        $response = $this->getJson("/api/reports/trip-manifest/{$trip->id}");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.trip.id', $trip->id)
            ->assertJsonPath('data.booked_seats', 1)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'trip' => [
                        'id',
                        'trip_code',
                        'departure_datetime',
                        'arrival_datetime',
                        'status',
                    ],
                    'route' => [
                        'id',
                        'name',
                        'origin',
                        'destination',
                    ],
                    'bus' => [
                        'id',
                        'bus_number',
                        'plate_number',
                        'model',
                        'total_seats',
                    ],
                    'driver' => [
                        'id',
                        'name',
                        'phone',
                    ],
                    'manifest_passengers' => [
                        '*' => [
                            'ticket_number',
                            'seat_number',
                            'passenger_name',
                            'national_id',
                            'phone',
                            'gender',
                            'passenger_type',
                            'from_station',
                            'to_station',
                            'fare',
                            'status',
                            'boarded_at',
                        ],
                    ],
                    'total_seats',
                    'booked_seats',
                    'occupancy_rate',
                ],
            ]);

        $this->assertEquals('سارة العتيبي', $response->json('data.manifest_passengers.0.passenger_name'));
        $this->assertEquals('1', $response->json('data.manifest_passengers.0.seat_number'));
    }

    public function test_empty_database_returns_safe_fallbacks_without_division_by_zero(): void
    {
        $admin = User::where('role', 'admin')->firstOrFail();
        Sanctum::actingAs($admin, ['*']);

        // حذف كافة التذاكر والحجوزات والرحلات لمحاكاة قاعدة بيانات خالية تماماً
        Ticket::query()->delete();
        BookingPassenger::query()->delete();
        Booking::query()->delete();
        Trip::query()->delete();

        $response = $this->getJson('/api/reports/summary');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.total_revenue', 0)
            ->assertJsonPath('data.today_revenue', 0)
            ->assertJsonPath('data.total_bookings', 0)
            ->assertJsonPath('data.total_tickets', 0)
            ->assertJsonPath('data.total_passengers', 0)
            ->assertJsonPath('data.average_ticket_fare', 0)
            ->assertJsonPath('data.average_occupancy_rate', 0)
            ->assertJsonPath('data.completed_trips', 0)
            ->assertJsonPath('data.scheduled_trips', 0)
            ->assertJsonPath('data.payment_methods_breakdown', []);

        $chartResponse = $this->getJson('/api/reports/revenue-chart');
        $chartResponse->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $routesResponse = $this->getJson('/api/reports/routes-performance');
        $routesResponse->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }

    public function test_validates_filter_inputs_with_arabic_messages(): void
    {
        $admin = User::where('role', 'admin')->firstOrFail();
        Sanctum::actingAs($admin, ['*']);

        $response = $this->getJson('/api/reports/summary?start_date=2026-10-25&end_date=2026-10-20&route_id=99999&period=invalid_period');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['end_date', 'route_id', 'period'])
            ->assertJsonPath('errors.end_date.0', 'تاريخ النهاية يجب أن يكون مساوياً أو لاحقاً لتاريخ البداية.')
            ->assertJsonPath('errors.route_id.0', 'مسار الرحلة المحدد غير موجود في النظام.')
            ->assertJsonPath('errors.period.0', 'الفترة المحددة غير صالحة. الخيارات المتاحة هي: اليوم، الأسبوع، الشهر، السنة، أو مخصص.');
    }
}
