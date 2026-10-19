<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seat_layouts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('bus_type')->default('standard'); // vip, standard, luxury, sleeper
            $table->integer('total_seats');
            $table->integer('total_rows');
            $table->integer('columns_per_row');
            $table->json('layout_json'); // seat grid with numbers, window/aisle, driver, doors
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seat_layouts');
    }
};
