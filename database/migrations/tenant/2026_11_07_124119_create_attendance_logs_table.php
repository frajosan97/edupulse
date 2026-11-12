<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('attendance_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('biometric_point_id')->constrained()->cascadeOnDelete();

            // Who — null if the scan couldn't be matched
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('biometric_finger_id')->nullable()->constrained()->nullOnDelete();

            // Idempotency — the device's own event id
            $table->string('device_event_id');
            $table->unique(
                ['biometric_point_id', 'device_event_id'],
                'attendance_logs_point_event_unique'
            );

            // check_in | check_out
            $table->string('type', 16)->default('check_in')->index();

            // Hash of the scan — for later matching if user_id was null
            $table->string('scanned_hash', 64)->nullable()->index();

            $table->timestamp('scanned_at');
            $table->date('scan_date')->index();

            // matched | unmatched
            $table->string('status', 16)->default('matched')->index();

            $table->timestamps();

            $table->index(['user_id', 'scan_date']);
            $table->index(['scan_date', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_logs');
    }
};