<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\BusController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RouteController;
use App\Http\Controllers\Api\SeatLayoutController;
use App\Http\Controllers\Api\StationController;
use App\Http\Controllers\Api\TripController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

// مسار تجريبي لاختبار الاتصال بقاعدة البيانات
Route::get('/test-db', function () {
    try {
        DB::connection()->getPdo();
        $dbName = DB::connection()->getDatabaseName();
        return response()->json([
            'status' => 'success',
            'message' => 'تم الاتصال بقاعدة البيانات بنجاح!',
            'database' => $dbName,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'فشل الاتصال بقاعدة البيانات: ' . $e->getMessage(),
        ], 500);
    }
});

// مسارات المصادقة (عامة)
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// مسارات تتطلب تسجيل دخول
Route::middleware('auth:sanctum')->group(function () {
    // المصادقة
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);

    // مسارات عامة لجميع المستخدمين المسجلين
    Route::get('stations', [StationController::class, 'index']);
    Route::get('routes', [RouteController::class, 'index']);
    Route::get('trips/search', [TripController::class, 'search']);
    Route::get('trips/{trip}/seat-map', [TripController::class, 'seatMap']);
    Route::post('bookings', [BookingController::class, 'store']);
    Route::get('bookings/{reference}', [BookingController::class, 'show']);
    Route::get('seat-layouts', [SeatLayoutController::class, 'index']);

    // مسارات الإدارة (admin و agent)
    Route::middleware('role:admin,agent')->group(function () {
        Route::get('trips', [TripController::class, 'index']);
        Route::get('trips/{trip}', [TripController::class, 'show']);
        Route::get('drivers', [DriverController::class, 'index']);
        Route::get('drivers/{driver}', [DriverController::class, 'show']);
        Route::get('buses', [BusController::class, 'index']);
        Route::get('buses/{bus}', [BusController::class, 'show']);
    });

    // مسارات التقارير والتحليلات (للمدير والموظف)
    Route::middleware('role:admin,agent')->prefix('reports')->group(function () {
        Route::get('summary', [ReportController::class, 'summary']);
        Route::get('revenue-chart', [ReportController::class, 'revenueChart']);
        Route::get('routes-performance', [ReportController::class, 'routesPerformance']);
        Route::get('trip-manifest/{trip}', [ReportController::class, 'tripManifest']);
    });

    // مسارات المدير فقط (admin)
    Route::middleware('role:admin')->group(function () {
        // CRUD كامل للمحطات
        Route::apiResource('stations', StationController::class)->except(['index']);
        // CRUD كامل للمسارات
        Route::apiResource('routes', RouteController::class)->except(['index']);
        // CRUD كامل للرحلات (store, update, destroy)
        Route::post('trips', [TripController::class, 'store']);
        Route::put('trips/{trip}', [TripController::class, 'update']);
        Route::delete('trips/{trip}', [TripController::class, 'destroy']);
        // CRUD كامل للسائقين والحافلات
        Route::apiResource('drivers', DriverController::class)->except(['index', 'show']);
        Route::apiResource('buses', BusController::class)->except(['index', 'show']);
    });
});
