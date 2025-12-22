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
        Schema::create('school_contacts', function (Blueprint $table) {
            $table->id();
            $table->enum('contact_type', ['phone', 'email', 'address', 'social']);
            $table->string('value', 255);
            $table->unsignedInteger('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['display_order']);
        });

        Schema::create('school_themes', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->char('primary_color', 7)->default('#3498db');
            $table->char('secondary_color', 7)->default('#2ecc71');
            $table->char('accent_color', 7)->default('#e74c3c');
            $table->char('text_color', 7)->default('#333333');
            $table->char('background_color', 7)->default('#ffffff');
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::create('school_images', function (Blueprint $table) {
            $table->id();
            $table->string('image_type');
            $table->string('image_path');
            $table->string('alt_text', 255)->nullable();
            $table->string('caption', 255)->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['image_type', 'display_order']);
        });

        Schema::create('school_slides', function (Blueprint $table) {
            $table->id();
            $table->string('title', 100);
            $table->text('description')->nullable();
            $table->string('image_path');
            $table->string('link_url')->nullable();
            $table->string('link_text', 50)->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->timestamps();

            $table->index(['display_order']);
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school_slides');
        Schema::dropIfExists('school_images');
        Schema::dropIfExists('school_themes');
        Schema::dropIfExists('school_contacts');
    }
};
