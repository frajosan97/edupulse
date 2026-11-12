<?php
// database/migrations/2025_01_01_000001_create_fee_structures_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('fee_structures', function (Blueprint $table) {
            $table->id();

            $table->foreignId('academic_year_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('term_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->foreignId('class_stream_id')->nullable()->constrained('class_streams')->nullOnDelete();

            $table->string('name');               // "Form 2 — Term 1 2025"
            $table->string('description')->nullable();
            $table->string('currency', 3)->default('KES');

            $table->boolean('is_active')->default(true);
            $table->boolean('is_published')->default(false);

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(
                ['academic_year_id', 'term_id', 'class_id', 'class_stream_id'],
                'fee_structures_scope_unique'
            );

            $table->index(['term_id', 'is_active']);
        });

        Schema::create('fee_structure_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('fee_structure_id')->constrained()->cascadeOnDelete();

            $table->string('name');                       // "Tuition", "Transport", "Lunch"
            $table->string('category')->nullable();       // tuition | transport | activity | exam
            $table->string('description')->nullable();

            $table->decimal('amount', 12, 2);
            $table->boolean('is_mandatory')->default(true);
            $table->boolean('is_prorated')->default(false);

            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_structure_items');
        Schema::dropIfExists('fee_structures');
    }
};