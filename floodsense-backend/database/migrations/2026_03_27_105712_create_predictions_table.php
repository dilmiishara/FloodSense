<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('predictions', function (Blueprint $table) {
            $table->id();

            // Foreign key (link to sensor data)
            $table->foreignId('sensor_data_id')
                ->constrained('sensor_data') // specify correct table
                ->onDelete('cascade');

            $table->enum('flood_risk_level', ['low','medium','high']);
            $table->float('predicted_water_level');
            $table->string('affected_area')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('predictions');
    }
};
