<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\StoreBookingRequest;
use App\Http\Resources\BookingResource;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;

class BookingController extends Controller
{
    public function __construct(
        protected readonly BookingService $bookingService
    ) {}

    /**
     * إنشاء حجز جديد وإصدار التذاكر وأكواد الـ QR للمسافرين
     */
    public function store(StoreBookingRequest $request): JsonResponse
    {
        $result = $this->bookingService->createBooking($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'تم تأكيد الحجز وإصدار التذاكر بنجاح!',
            'data' => $result,
        ], 201);
    }

    /**
     * الاستعلام عن حجز برقم المرجع (PNR)
     */
    public function show(string $reference): JsonResponse
    {
        $booking = $this->bookingService->findBookingByReference($reference);

        if (!$booking) {
            return response()->json([
                'status' => 'error',
                'message' => 'رقم الحجز غير موجود.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => new BookingResource($booking),
        ]);
    }
}
