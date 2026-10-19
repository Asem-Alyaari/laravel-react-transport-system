<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_reference')->unique(); // PNR code e.g. PNR-789234
            $table->foreignId('trip_id')->constrained('trips')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email')->nullable();
            $table->string('customer_national_id')->nullable();
            $table->integer('total_passengers')->default(1);
            $table->decimal('subtotal_amount', 10, 2);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            $table->string('payment_method')->default('cash'); // cash, card, online, wallet
            $table->enum('payment_status', ['unpaid', 'paid', 'partially_refunded', 'refunded', 'failed'])->default('unpaid');
            $table->enum('booking_status', ['confirmed', 'pending', 'cancelled', 'completed'])->default('confirmed');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
