<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Driver\StoreDriverRequest;
use App\Http\Requests\Driver\UpdateDriverRequest;
use App\Http\Resources\DriverResource;
use App\Models\Driver;
use App\Services\DriverService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DriverController extends Controller
{
    public function __construct(
        protected readonly DriverService $driverService
    ) {}

    /**
     * عرض قائمة السائقين
     */
    public function index(Request $request): JsonResponse
    {
        $drivers = $this->driverService->listDrivers(
            search: $request->query('search'),
            status: $request->query('status')
        );

        return response()->json([
            'status' => 'success',
            'data' => DriverResource::collection($drivers),
        ]);
    }

    /**
     * إضافة سائق جديد
     */
    public function store(StoreDriverRequest $request): JsonResponse
    {
        $driver = $this->driverService->createDriver($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'تمت إضافة السائق بنجاح',
            'data' => new DriverResource($driver),
        ], 201);
    }

    /**
     * عرض بيانات سائق محدد
     */
    public function show(Driver $driver): JsonResponse
    {
        $driver->load(['trips' => function ($q) {
            $q->latest()->limit(5);
        }]);

        return response()->json([
            'status' => 'success',
            'data' => new DriverResource($driver),
        ]);
    }

    /**
     * تعديل بيانات سائق
     */
    public function update(UpdateDriverRequest $request, Driver $driver): JsonResponse
    {
        $updatedDriver = $this->driverService->updateDriver($driver, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'تم تحديث بيانات السائق بنجاح',
            'data' => new DriverResource($updatedDriver),
        ]);
    }

    /**
     * حذف سائق
     */
    public function destroy(Driver $driver): JsonResponse
    {
        $this->driverService->deleteDriver($driver);

        return response()->json([
            'status' => 'success',
            'message' => 'تم حذف السائق بنجاح',
        ]);
    }
}
