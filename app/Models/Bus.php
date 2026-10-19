<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bus extends Model
{
    use HasFactory;

    protected $fillable = [
        'bus_number',
        'plate_number',
        'seat_layout_id',
        'model',
        'manufacture_year',
        'amenities',
        'status',
    ];

    protected $casts = [
        'manufacture_year' => 'integer',
        'amenities' => 'array',
    ];

    public function seatLayout(): BelongsTo
    {
        return $this->belongsTo(SeatLayout::class);
    }

    public function trips(): HasMany
    {
        return $this->hasMany(Trip::class);
    }
}
