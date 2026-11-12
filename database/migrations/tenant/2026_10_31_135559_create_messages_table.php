<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->string('message_type')->nullable();
            $table->string('message_id', 50)->nullable();
            $table->string('mobile', 20);
            $table->longText('message')->nullable();
            $table->integer('response_code')->nullable();
            $table->string('response_description')->nullable();
            $table->integer('network_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('mobile');
            $table->index('message_id');
            $table->index('response_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};