<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Report\ReportFilterRequest;
use App\Models\Trip;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function __construct(
        protected readonly ReportService $reportService
    ) {}

    /**
     * عرض ملخص الأداء والإحصائيات والتحليلات
     */
    public function summary(ReportFilterRequest $request): JsonResponse
    {
        [$startDate, $endDate] = $request->dateRange();
        $routeId = $request->filled('route_id') ? (int) $request->input('route_id') : null;

        $data = $this->reportService->getSummary($startDate, $endDate, $routeId);

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * عرض المخطط البياني اليومي للإيرادات والحجوزات
     */
    public function revenueChart(ReportFilterRequest $request): JsonResponse
    {
        [$startDate, $endDate] = $request->dateRange();
        $routeId = $request->filled('route_id') ? (int) $request->input('route_id') : null;

        $data = $this->reportService->getRevenueChart($startDate, $endDate, $routeId);

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * عرض تقرير أداء المسارات ومعدلات إشغالها
     */
    public function routesPerformance(ReportFilterRequest $request): JsonResponse
    {
        [$startDate, $endDate] = $request->dateRange();

        $data = $this->reportService->getRoutesPerformance($startDate, $endDate);

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * استخراج كشف ركاب الرحلة (Passenger Manifest)
     */
    public function tripManifest(Trip $trip): JsonResponse
    {
        $data = $this->reportService->getTripManifest($trip);

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }
}
