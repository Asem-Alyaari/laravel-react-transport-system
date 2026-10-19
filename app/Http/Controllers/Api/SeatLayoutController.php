<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SeatLayoutResource;
use App\Models\SeatLayout;
use Illuminate\Http\JsonResponse;

class SeatLayoutController extends Controller
{
    /**
     * قائمة قوالب المقاعد المتاحة
     */
    public function index(): JsonResponse
    {
        $layouts = SeatLayout::orderBy('id', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'data' => SeatLayoutResource::collection($layouts),
        ]);
    }
}
