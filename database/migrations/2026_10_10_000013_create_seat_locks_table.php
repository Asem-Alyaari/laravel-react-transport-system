<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seat_locks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_id')->constrained('trips')->cascadeOnDelete();
            $table->string('seat_number');
            $table->integer('from_stop_order');
            $table->integer('to_stop_order');
            $table->string('session_id');
            $table->dateTime('locked_until');
            $table->timestamps();

            $table->index(['trip_id', 'seat_number', 'locked_until']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seat_locks');
    }
};
