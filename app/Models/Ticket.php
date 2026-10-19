<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_number',
        'booking_id',
        'booking_passenger_id',
        'trip_id',
        'seat_number',
        'from_station_id',
        'to_station_id',
        'from_stop_order',
        'to_stop_order',
        'fare',
        'qr_code_hash',
        'status',
        'boarded_at',
    ];

    protected $casts = [
        'from_stop_order' => 'integer',
        'to_stop_order' => 'integer',
        'fare' => 'decimal:2',
        'boarded_at' => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function passenger(): BelongsTo
    {
        return $this->belongsTo(BookingPassenger::class, 'booking_passenger_id');
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function fromStation(): BelongsTo
    {
        return $this->belongsTo(Station::class, 'from_station_id');
    }

    public function toStation(): BelongsTo
    {
        return $this->belongsTo(Station::class, 'to_station_id');
    }
}
