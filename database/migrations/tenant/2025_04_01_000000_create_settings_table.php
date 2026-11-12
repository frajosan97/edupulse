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
            $table->string('contact_type', 255);
            $table->string('value', 255);
            $table->unsignedInteger('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            // Performance indexes
            $table->index(['display_order', 'is_active']);
            $table->index('contact_type');
            $table->index('value');
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
            $table->softDeletes();

            // Performance indexes
            $table->index('name');
            $table->index(['is_default', 'created_at']);
        });

        Schema::create('school_images', function (Blueprint $table) {
            $table->id();
            $table->string('image_type');
            $table->string('image_path');
            $table->string('image_id')->nullable();
            $table->string('delete_url')->nullable();
            $table->integer('image_size')->nullable();
            $table->integer('image_width')->nullable();
            $table->integer('image_height')->nullable();
            $table->string('alt_text', 255)->nullable();
            $table->string('caption', 255)->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            // Performance indexes
            $table->index(['image_type', 'display_order', 'is_active']);
            $table->index(['image_type', 'is_active']);
            $table->index('image_path');
            $table->index('display_order');
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
            $table->softDeletes();

            // Performance indexes
            $table->index(['display_order', 'is_active']);
            $table->index(['is_active', 'start_date', 'end_date']);
            $table->index(['start_date', 'end_date']);
            $table->index('title');
            $table->index(['is_active', 'display_order']);
        });

        /**
         * Academic Years (Normalize academic_year)
         */
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();

            // Audit fields
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('deleted_by')->nullable()->constrained('users')->onDelete('set null');

            $table->timestamps();
            $table->softDeletes();

            // Performance indexes
            $table->index(['start_date', 'end_date']);
        });

        /**
         * Terms (belong to academic year)
         */
        Schema::create('terms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();

            // Audit fields
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('deleted_by')->nullable()->constrained('users')->onDelete('set null');

            $table->timestamps();
            $table->softDeletes();

            // Unique and indexes
            $table->unique(['academic_year_id', 'name']);
            $table->index(['start_date', 'end_date']);
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('terms');
        Schema::dropIfExists('academic_years');
        Schema::dropIfExists('school_slides');
        Schema::dropIfExists('school_images');
        Schema::dropIfExists('school_themes');
        Schema::dropIfExists('school_contacts');
    }
};