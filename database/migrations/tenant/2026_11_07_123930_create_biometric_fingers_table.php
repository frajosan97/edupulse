<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('biometric_fingers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // right_thumb, right_index, right_middle, right_ring, right_pinky,
            // left_thumb,  left_index,  left_middle,  left_ring,  left_pinky
            $table->string('finger', 20);

            // Opaque template — never raw biometric
            $table->text('template');
            $table->string('template_hash', 64)->index();   // sha256, for matching

            // 0–100, from the SDK
            $table->unsignedTinyInteger('quality')->nullable();

            // active | revoked
            $table->string('status', 24)->default('active')->index();

            $table->foreignId('enrolled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('enrolled_at');

            $table->timestamp('revoked_at')->nullable();
            $table->foreignId('revoked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('revoke_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // A user can have at most one active template per finger
            $table->unique(['user_id', 'finger', 'status'], 'biometric_fingers_user_finger_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('biometric_fingers');
    }
};