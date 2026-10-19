<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trip extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_code',
        'route_id',
        'bus_id',
        'driver_id',
        'departure_datetime',
        'arrival_datetime',
        'base_fare',
        'status',
        'remarks',
    ];

    protected $casts = [
        'departure_datetime' => 'datetime',
        'arrival_datetime' => 'datetime',
        'base_fare' => 'decimal:2',
    ];

    public function route(): BelongsTo
    {
        return $this->belongsTo(Route::class);
    }

    public function bus(): BelongsTo
    {
        return $this->belongsTo(Bus::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function stops(): HasMany
    {
        return $this->hasMany(TripStop::class)->orderBy('stop_order');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    public function seatLocks(): HasMany
    {
        return $this->hasMany(SeatLock::class);
    }
}
