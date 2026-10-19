<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('origin_station_id')->constrained('stations')->cascadeOnDelete();
            $table->foreignId('destination_station_id')->constrained('stations')->cascadeOnDelete();
            $table->decimal('distance_km', 8, 2)->default(0);
            $table->integer('estimated_duration_minutes')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('routes');
    }
};
