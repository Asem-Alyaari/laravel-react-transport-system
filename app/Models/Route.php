<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Route extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'origin_station_id',
        'destination_station_id',
        'distance_km',
        'estimated_duration_minutes',
        'is_active',
    ];

    protected $casts = [
        'distance_km' => 'decimal:2',
        'estimated_duration_minutes' => 'integer',
        'is_active' => 'boolean',
    ];

    public function originStation(): BelongsTo
    {
        return $this->belongsTo(Station::class, 'origin_station_id');
    }

    public function destinationStation(): BelongsTo
    {
        return $this->belongsTo(Station::class, 'destination_station_id');
    }

    public function stops(): HasMany
    {
        return $this->hasMany(RouteStop::class)->orderBy('stop_order');
    }

    public function trips(): HasMany
    {
        return $this->hasMany(Trip::class);
    }

    public function segmentFares(): HasMany
    {
        return $this->hasMany(SegmentFare::class);
    }
}
