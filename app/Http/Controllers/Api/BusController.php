<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Bus\StoreBusRequest;
use App\Http\Requests\Bus\UpdateBusRequest;
use App\Http\Resources\BusResource;
use App\Models\Bus;
use App\Services\BusService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BusController extends Controller
{
    public function __construct(
        protected readonly BusService $busService
    ) {}

    /**
     * عرض قائمة أسطول الحافلات
     */
    public function index(Request $request): JsonResponse
    {
        $buses = $this->busService->listBuses(
            search: $request->query('search'),
            status: $request->query('status')
        );

        return response()->json([
            'status' => 'success',
            'data' => BusResource::collection($buses),
        ]);
    }

    /**
     * إضافة حافلة جديدة إلى الأسطول
     */
    public function store(StoreBusRequest $request): JsonResponse
    {
        $bus = $this->busService->createBus($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'تمت إضافة الحافلة بنجاح إلى الأسطول',
            'data' => new BusResource($bus),
        ], 201);
    }

    /**
     * عرض بيانات حافلة محددة
     */
    public function show(Bus $bus): JsonResponse
    {
        $bus->load(['seatLayout', 'trips' => function ($q) {
            $q->latest()->limit(5);
        }]);

        return response()->json([
            'status' => 'success',
            'data' => new BusResource($bus),
        ]);
    }

    /**
     * تعديل بيانات حافلة
     */
    public function update(UpdateBusRequest $request, Bus $bus): JsonResponse
    {
        $updatedBus = $this->busService->updateBus($bus, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'تم تحديث بيانات الحافلة بنجاح',
            'data' => new BusResource($updatedBus),
        ]);
    }

    /**
     * حذف حافلة من الأسطول
     */
    public function destroy(Bus $bus): JsonResponse
    {
        $this->busService->deleteBus($bus);

        return response()->json([
            'status' => 'success',
            'message' => 'تم حذف الحافلة بنجاح من الأسطول',
        ]);
    }
}
