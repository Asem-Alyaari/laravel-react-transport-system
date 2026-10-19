<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SegmentFare extends Model
{
    use HasFactory;

    protected $fillable = [
        'route_id',
        'from_station_id',
        'to_station_id',
        'fare',
        'vip_fare',
        'child_fare',
    ];

    protected $casts = [
        'fare' => 'decimal:2',
        'vip_fare' => 'decimal:2',
        'child_fare' => 'decimal:2',
    ];

    public function route(): BelongsTo
    {
        return $this->belongsTo(Route::class);
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
