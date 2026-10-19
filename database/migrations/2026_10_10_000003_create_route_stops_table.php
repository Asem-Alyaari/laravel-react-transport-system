<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('route_stops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained('routes')->cascadeOnDelete();
            $table->foreignId('station_id')->constrained('stations')->cascadeOnDelete();
            $table->integer('stop_order');
            $table->decimal('distance_from_origin_km', 8, 2)->default(0);
            $table->integer('duration_from_origin_minutes')->default(0);
            $table->integer('dwell_time_minutes')->default(15);
            $table->timestamps();

            $table->unique(['route_id', 'stop_order']);
            $table->unique(['route_id', 'station_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('route_stops');
    }
};
