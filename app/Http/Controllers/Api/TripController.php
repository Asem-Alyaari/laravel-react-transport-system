<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Trip\SearchTripsRequest;
use App\Http\Requests\Trip\SeatMapRequest;
use App\Http\Requests\Trip\StoreTripRequest;
use App\Http\Requests\Trip\UpdateTripRequest;
use App\Http\Resources\TripResource;
use App\Models\Trip;
use App\Services\TripService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TripController extends Controller
{
    public function __construct(
        protected readonly TripService $tripService
    ) {}

    /**
     * عرض قائمة الرحلات مع الفلترة والبحث
     */
    public function index(Request $request): JsonResponse
    {
        $trips = $this->tripService->listTrips(
            search: $request->query('search'),
            status: $request->query('status'),
            routeId: $request->query('route_id')
        );

        return response()->json([
            'status' => 'success',
            'data' => TripResource::collection($trips),
        ]);
    }

    /**
     * إنشاء رحلة جديدة
     */
    public function store(StoreTripRequest $request): JsonResponse
    {
        $trip = $this->tripService->createTrip($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'تم إنشاء الرحلة بنجاح',
            'data' => new TripResource($trip),
        ], 201);
    }

    /**
     * عرض تفاصيل رحلة محددة
     */
    public function show(Trip $trip): JsonResponse
    {
        $trip->load([
            'route.originStation',
            'route.destinationStation',
            'bus.seatLayout',
            'driver',
            'stops.station',
        ]);
        $trip->loadCount('bookings');

        return response()->json([
            'status' => 'success',
            'data' => new TripResource($trip),
        ]);
    }

    /**
     * تحديث بيانات رحلة
     */
    public function update(UpdateTripRequest $request, Trip $trip): JsonResponse
    {
        $updatedTrip = $this->tripService->updateTrip($trip, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'تم تحديث بيانات الرحلة بنجاح',
            'data' => new TripResource($updatedTrip),
        ]);
    }

    /**
     * حذف رحلة
     */
    public function destroy(Trip $trip): JsonResponse
    {
        try {
            $this->tripService->deleteTrip($trip);

            return response()->json([
                'status' => 'success',
                'message' => 'تم حذف الرحلة بنجاح',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * البحث عن الرحلات المتاحة بين أي محطتين
     */
    public function search(SearchTripsRequest $request): JsonResponse
    {
        $trips = $this->tripService->searchTrips(
            originId: (int) $request->validated('origin_id'),
            destinationId: (int) $request->validated('destination_id'),
            dateString: $request->validated('date')
        );

        return response()->json([
            'status' => 'success',
            'data' => TripResource::collection($trips),
        ]);
    }

    /**
     * جلب خريطة المقاعد التفاعلية للرحلة على مقطع محدد
     */
    public function seatMap(Trip $trip, SeatMapRequest $request): JsonResponse
    {
        try {
            $seatMap = $this->tripService->getSeatMap(
                trip: $trip,
                fromStationId: (int) $request->validated('from_station_id'),
                toStationId: (int) $request->validated('to_station_id'),
                sessionId: $request->validated('session_id')
            );

            return response()->json([
                'status' => 'success',
                'data' => $seatMap,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
