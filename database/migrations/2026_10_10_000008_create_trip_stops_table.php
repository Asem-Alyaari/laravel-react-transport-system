<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trip_stops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained('trips')->cascadeOnDelete();
            $table->foreignId('station_id')->constrained('stations')->cascadeOnDelete();
            $table->integer('stop_order');
            $table->dateTime('scheduled_arrival');
            $table->dateTime('scheduled_departure');
            $table->dateTime('actual_arrival')->nullable();
            $table->dateTime('actual_departure')->nullable();
            $table->enum('status', ['pending', 'arrived', 'departed', 'skipped'])->default('pending');
            $table->timestamps();

            $table->unique(['trip_id', 'stop_order']);
            $table->unique(['trip_id', 'station_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_stops');
    }
};
