<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingPassenger;
use App\Models\RouteStop;
use App\Models\SegmentFare;
use App\Models\Ticket;
use App\Models\Trip;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BookingService
{
    /**
     * تنفيذ دورة الحجز الكاملة وإصدار التذاكر وأكواد الـ QR داخل Transaction
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     * @throws ValidationException
     */
    public function createBooking(array $data): array
    {
        $trip = Trip::with(['route', 'bus.seatLayout'])->findOrFail($data['trip_id']);
        $fromId = (int) $data['from_station_id'];
        $toId = (int) $data['to_station_id'];

        $fromStop = RouteStop::where('route_id', $trip->route_id)->where('station_id', $fromId)->first();
        $toStop = RouteStop::where('route_id', $trip->route_id)->where('station_id', $toId)->first();

        if (!$fromStop || !$toStop || $fromStop->stop_order >= $toStop->stop_order) {
            throw ValidationException::withMessages([
                'to_station_id' => ['محطة النزول يجب أن تكون بعد محطة الصعود على خط السير.'],
            ]);
        }

        $fromOrder = $fromStop->stop_order;
        $toOrder = $toStop->stop_order;

        $fareObj = SegmentFare::where('route_id', $trip->route_id)
            ->where('from_station_id', $fromId)
            ->where('to_station_id', $toId)
            ->first();

        $baseSeatFare = $fareObj ? (float) $fareObj->fare : (float) $trip->base_fare;

        return DB::transaction(function () use ($data, $trip, $fromId, $toId, $fromOrder, $toOrder, $baseSeatFare) {
            $requestedSeats = array_column($data['passengers'], 'seat_number');

            $alreadyBooked = Ticket::where('trip_id', $trip->id)
                ->whereIn('status', ['valid', 'boarded'])
                ->whereIn('seat_number', $requestedSeats)
                ->where('from_stop_order', '<', $toOrder)
                ->where('to_stop_order', '>', $fromOrder)
                ->lockForUpdate()
                ->pluck('seat_number')
                ->toArray();

            if (!empty($alreadyBooked)) {
                throw ValidationException::withMessages([
                    'seats' => ['عذراً، المقاعد التالية تم حجزها للتو: ' . implode(', ', $alreadyBooked)],
                ]);
            }

            $passengerCount = count($data['passengers']);
            $subtotal = $passengerCount * $baseSeatFare;
            $tax = round($subtotal * 0.15, 2);
            $total = $subtotal + $tax;

            $booking = Booking::create([
                'booking_reference' => 'PNR-' . strtoupper(Str::random(6)),
                'trip_id' => $trip->id,
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_email' => $data['customer_email'] ?? null,
                'customer_national_id' => $data['customer_national_id'] ?? null,
                'total_passengers' => $passengerCount,
                'subtotal_amount' => $subtotal,
                'tax_amount' => $tax,
                'discount_amount' => 0,
                'total_amount' => $total,
                'payment_method' => $data['payment_method'] ?? 'cash',
                'payment_status' => 'paid',
                'booking_status' => 'confirmed',
            ]);

            $issuedTickets = [];

            foreach ($data['passengers'] as $pData) {
                $passenger = BookingPassenger::create([
                    'booking_id' => $booking->id,
                    'name' => $pData['name'],
                    'national_id' => $pData['national_id'] ?? null,
                    'gender' => $pData['gender'],
                    'passenger_type' => $pData['passenger_type'] ?? 'adult',
                    'phone' => $data['customer_phone'],
                ]);

                $ticketNumber = 'TCK-' . date('Ymd') . '-' . strtoupper(Str::random(4));
                $qrHash = hash('sha256', $ticketNumber . '|' . $trip->id . '|' . $pData['seat_number'] . '|' . config('app.key'));

                $ticket = Ticket::create([
                    'ticket_number' => $ticketNumber,
                    'booking_id' => $booking->id,
                    'booking_passenger_id' => $passenger->id,
                    'trip_id' => $trip->id,
                    'seat_number' => $pData['seat_number'],
                    'from_station_id' => $fromId,
                    'to_station_id' => $toId,
                    'from_stop_order' => $fromOrder,
                    'to_stop_order' => $toOrder,
                    'fare' => $baseSeatFare,
                    'qr_code_hash' => $qrHash,
                    'status' => 'valid',
                ]);

                $issuedTickets[] = [
                    'ticket_number' => $ticket->ticket_number,
                    'passenger_name' => $passenger->name,
                    'seat_number' => $ticket->seat_number,
                    'fare' => (float) $ticket->fare,
                    'qr_code_hash' => $ticket->qr_code_hash,
                ];
            }

            return [
                'booking_reference' => $booking->booking_reference,
                'trip_code' => $trip->trip_code,
                'route_name' => $trip->route->name,
                'customer_name' => $booking->customer_name,
                'customer_phone' => $booking->customer_phone,
                'total_passengers' => $booking->total_passengers,
                'subtotal' => (float) $booking->subtotal_amount,
                'tax' => (float) $booking->tax_amount,
                'total_amount' => (float) $booking->total_amount,
                'payment_method' => $booking->payment_method,
                'tickets' => $issuedTickets,
            ];
        });
    }

    /**
     * الاستعلام عن حجز بواسطة رمز PNR
     */
    public function findBookingByReference(string $reference): ?Booking
    {
        return Booking::with([
            'trip.route',
            'trip.bus',
            'passengers',
            'tickets.fromStation',
            'tickets.toStation',
        ])
            ->where('booking_reference', strtoupper($reference))
            ->first();
    }
}
