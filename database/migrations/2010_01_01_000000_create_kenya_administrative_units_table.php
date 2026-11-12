<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('counties', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('name');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('constituencies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('county_id')
                ->constrained('counties')
                ->onDelete('cascade');
            $table->string('code', 10)->unique();
            $table->string('name');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('wards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('constituency_id')
                ->constrained('constituencies')
                ->onDelete('cascade');
            $table->string('code', 10)->unique();
            $table->string('name');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ward_id')
                ->constrained('wards')
                ->onDelete('cascade');
            $table->string('code', 10)->unique();
            $table->string('name');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('locations');
        Schema::dropIfExists('wards');
        Schema::dropIfExists('constituencies');
        Schema::dropIfExists('counties');
    }
};
