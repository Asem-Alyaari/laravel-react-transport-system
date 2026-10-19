<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteStop extends Model
{
    use HasFactory;

    protected $fillable = [
        'route_id',
        'station_id',
        'stop_order',
        'distance_from_origin_km',
        'duration_from_origin_minutes',
        'dwell_time_minutes',
    ];

    protected $casts = [
        'stop_order' => 'integer',
        'distance_from_origin_km' => 'decimal:2',
        'duration_from_origin_minutes' => 'integer',
        'dwell_time_minutes' => 'integer',
    ];

    public function route(): BelongsTo
    {
        return $this->belongsTo(Route::class);
    }

    public function station(): BelongsTo
    {
        return $this->belongsTo(Station::class);
    }
}
