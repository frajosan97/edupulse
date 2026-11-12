<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('biometric_points', function (Blueprint $table) {
            $table->id();

            $table->string('name');                    // "Main Gate", "Staff Room"
            $table->string('code')->unique();          // "GATE-01", "STAFF-01"
            $table->string('location')->nullable();    // free text address / area

            $table->string('device_serial')->nullable()->index();
            $table->string('ip_address')->nullable();

            // check_in | check_out | both
            $table->string('mode', 16)->default('both');

            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('biometric_points');
    }
};