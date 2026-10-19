<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Route\StoreRouteRequest;
use App\Http\Requests\Route\UpdateRouteRequest;
use App\Http\Resources\RouteResource;
use App\Models\Route;
use App\Services\RouteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RouteController extends Controller
{
    public function __construct(
        protected readonly RouteService $routeService
    ) {}

    /**
     * عرض قائمة المسارات
     */
    public function index(Request $request): JsonResponse
    {
        $activeOnly = null;
        if ($request->has('active_only')) {
            $activeOnly = $request->boolean('active_only');
        } elseif ($request->has('activeOnly')) {
            $activeOnly = $request->boolean('activeOnly');
        }

        $routes = $this->routeService->listRoutes(
            search: $request->query('search'),
            activeOnly: $activeOnly
        );

        return response()->json([
            'status' => 'success',
            'data' => RouteResource::collection($routes),
        ]);
    }

    /**
     * إنشاء مسار جديد
     */
    public function store(StoreRouteRequest $request): JsonResponse
    {
        $route = $this->routeService->createRoute($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'تم إنشاء المسار بنجاح',
            'data' => new RouteResource($route),
        ], 201);
    }

    /**
     * عرض تفاصيل مسار محدد
     */
    public function show(Route $route): JsonResponse
    {
        $route->load([
            'originStation',
            'destinationStation',
            'stops.station',
            'segmentFares.fromStation',
            'segmentFares.toStation',
        ])->loadCount(['trips', 'stops']);

        return response()->json([
            'status' => 'success',
            'data' => new RouteResource($route),
        ]);
    }

    /**
     * تحديث بيانات مسار
     */
    public function update(UpdateRouteRequest $request, Route $route): JsonResponse
    {
        $updatedRoute = $this->routeService->updateRoute($route, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'تم تحديث بيانات المسار بنجاح',
            'data' => new RouteResource($updatedRoute),
        ]);
    }

    /**
     * حذف مسار
     */
    public function destroy(Route $route): JsonResponse
    {
        try {
            $this->routeService->deleteRoute($route);

            return response()->json([
                'status' => 'success',
                'message' => 'تم حذف المسار بنجاح',
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
