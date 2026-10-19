<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Station extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_ar',
        'name_en',
        'code',
        'city',
        'address',
        'latitude',
        'longitude',
        'phone',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function originRoutes(): HasMany
    {
        return $this->hasMany(Route::class, 'origin_station_id');
    }

    public function destinationRoutes(): HasMany
    {
        return $this->hasMany(Route::class, 'destination_station_id');
    }

    public function routeStops(): HasMany
    {
        return $this->hasMany(RouteStop::class);
    }
}
