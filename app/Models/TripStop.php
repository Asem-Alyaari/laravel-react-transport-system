<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TripStop extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_id',
        'station_id',
        'stop_order',
        'scheduled_arrival',
        'scheduled_departure',
        'actual_arrival',
        'actual_departure',
        'status',
    ];

    protected $casts = [
        'stop_order' => 'integer',
        'scheduled_arrival' => 'datetime',
        'scheduled_departure' => 'datetime',
        'actual_arrival' => 'datetime',
        'actual_departure' => 'datetime',
    ];

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }
}
