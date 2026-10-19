<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->id();
            $table->string('trip_code')->unique();
            $table->foreignId('route_id')->constrained('routes')->cascadeOnDelete();
            $table->foreignId('bus_id')->constrained('buses')->cascadeOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained('drivers')->nullOnDelete();
            $table->dateTime('departure_datetime');
            $table->dateTime('arrival_datetime');
            $table->decimal('base_fare', 10, 2);
            $table->enum('status', ['scheduled', 'boarding', 'in_transit', 'completed', 'delayed', 'cancelled'])->default('scheduled');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};
