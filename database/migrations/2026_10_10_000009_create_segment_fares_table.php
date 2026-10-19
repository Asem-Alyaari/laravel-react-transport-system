<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('segment_fares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained('routes')->cascadeOnDelete();
            $table->foreignId('from_station_id')->constrained('stations')->cascadeOnDelete();
            $table->foreignId('to_station_id')->constrained('stations')->cascadeOnDelete();
            $table->decimal('fare', 10, 2);
            $table->decimal('vip_fare', 10, 2)->nullable();
            $table->decimal('child_fare', 10, 2)->nullable();
            $table->timestamps();

            $table->unique(['route_id', 'from_station_id', 'to_station_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('segment_fares');
    }
};
