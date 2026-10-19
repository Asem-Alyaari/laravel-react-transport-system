<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('buses', function (Blueprint $table) {
            $table->id();
            $table->string('bus_number')->unique();
            $table->string('plate_number');
            $table->foreignId('seat_layout_id')->constrained('seat_layouts')->cascadeOnDelete();
            $table->string('model')->nullable();
            $table->integer('manufacture_year')->nullable();
            $table->json('amenities')->nullable(); // ['wifi', 'usb_charger', 'toilet', 'screens', 'ac']
            $table->enum('status', ['active', 'maintenance', 'out_of_service'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('buses');
    }
};
