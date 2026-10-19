<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeatLock extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_id',
        'seat_number',
        'from_stop_order',
        'to_stop_order',
        'session_id',
        'locked_until',
    ];

    protected $casts = [
        'from_stop_order' => 'integer',
        'to_stop_order' => 'integer',
        'locked_until' => 'datetime',
    ];

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }
}
