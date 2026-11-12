<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('demo_requests', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('phone');
            $table->string('email');
            $table->string('school');
            $table->string('interest')->nullable();
            $table->text('message')->nullable();
            $table->enum('status', [
                'pending',
                'contacted',
                'scheduled',
                'rejected'
            ])->default('pending');
            $table->timestamp('contacted_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demo_requests');
    }
};