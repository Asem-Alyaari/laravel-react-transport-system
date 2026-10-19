<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SeatLayout extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'bus_type',
        'total_seats',
        'total_rows',
        'columns_per_row',
        'layout_json',
    ];

    protected $casts = [
        'total_seats' => 'integer',
        'total_rows' => 'integer',
        'columns_per_row' => 'integer',
        'layout_json' => 'array',
    ];

    public function buses(): HasMany
    {
        return $this->hasMany(Bus::class);
    }
}
