<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique(); // e.g. TCK-202610-0001
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('booking_passenger_id')->constrained('booking_passengers')->cascadeOnDelete();
            $table->foreignId('trip_id')->constrained('trips')->cascadeOnDelete();
            $table->string('seat_number'); // e.g. "12", "14A"
            $table->foreignId('from_station_id')->constrained('stations')->cascadeOnDelete();
            $table->foreignId('to_station_id')->constrained('stations')->cascadeOnDelete();
            $table->integer('from_stop_order');
            $table->integer('to_stop_order');
            $table->decimal('fare', 10, 2);
            $table->string('qr_code_hash', 64)->unique(); // token checked by driver scanner
            $table->enum('status', ['valid', 'boarded', 'no_show', 'cancelled', 'refunded'])->default('valid');
            $table->dateTime('boarded_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
