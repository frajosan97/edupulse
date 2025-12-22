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
        Schema::create('navbars', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('navbar_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('navbar_id')->constrained()->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('navbar_items')->onDelete('cascade');
            $table->string('icon')->nullable();
            $table->string('label')->nullable();
            $table->string('path')->nullable();
            $table->string('route_name')->nullable();
            $table->json('route_parameters')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->json('permissions')->nullable();
            $table->timestamps();

            $table->index(['navbar_id', 'parent_id']);
            $table->index('order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('navbar_items');
        Schema::dropIfExists('navbars');
    }
};
