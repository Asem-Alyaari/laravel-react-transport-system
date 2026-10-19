<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Station\StoreStationRequest;
use App\Http\Requests\Station\UpdateStationRequest;
use App\Http\Resources\StationResource;
use App\Models\Station;
use App\Services\StationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class StationController extends Controller
{
    public function __construct(
        protected readonly StationService $stationService
    ) {}

    /**
     * قائمة المحطات مع دعم البحث والفلترة
     */
    public function index(Request $request): JsonResponse
    {
        $activeOnly = null;
        if ($request->has('active_only')) {
            $activeOnly = $request->boolean('active_only');
        } elseif ($request->has('activeOnly')) {
            $activeOnly = $request->boolean('activeOnly');
        }

        $stations = $this->stationService->listStations(
            search: $request->query('search'),
            activeOnly: $activeOnly
        );

        return response()->json([
            'status' => 'success',
            'data' => StationResource::collection($stations),
        ]);
    }

    /**
     * إنشاء محطة جديدة
     */
    public function store(StoreStationRequest $request): JsonResponse
    {
        $station = $this->stationService->createStation($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'تم إنشاء المحطة بنجاح',
            'data' => new StationResource($station),
        ], 201);
    }

    /**
     * عرض تفاصيل محطة محددة
     */
    public function show(Station $station): JsonResponse
    {
        $station->loadCount(['originRoutes', 'destinationRoutes', 'routeStops']);

        return response()->json([
            'status' => 'success',
            'data' => new StationResource($station),
        ]);
    }

    /**
     * تحديث بيانات محطة
     */
    public function update(UpdateStationRequest $request, Station $station): JsonResponse
    {
        $updatedStation = $this->stationService->updateStation($station, $request->validated());
        $updatedStation->loadCount(['originRoutes', 'destinationRoutes', 'routeStops']);

        return response()->json([
            'status' => 'success',
            'message' => 'تم تحديث بيانات المحطة بنجاح',
            'data' => new StationResource($updatedStation),
        ]);
    }

    /**
     * حذف محطة
     */
    public function destroy(Station $station): JsonResponse
    {
        try {
            $this->stationService->deleteStation($station);

            return response()->json([
                'status' => 'success',
                'message' => 'تم حذف المحطة بنجاح',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);
        }
    }
}
