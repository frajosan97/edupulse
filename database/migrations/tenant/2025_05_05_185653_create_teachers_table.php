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
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('department_id')
                ->nullable()
                ->constrained('departments')
                ->nullOnDelete();
            $table->date('joining_date');
            $table->text('qualifications')->nullable();
            $table->string('specialization')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('department_id');
        });

        Schema::create('teacher_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')
                ->nullable()
                ->constrained('academic_years')
                ->nullOnDelete();
            $table->foreignId('term_id')
                ->nullable()
                ->constrained('terms')
                ->nullOnDelete();
            $table->foreignId('class_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_stream_id')->nullable()->constrained()->onDelete('cascade');
            $table->enum('role', ['primary', 'assistant', 'substitute'])->default('primary');
            $table->enum('level', ['class', 'stream'])->default('class');
            $table->boolean('is_active')->default(true);
            $table->date('assigned_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(
                ['teacher_id', 'class_id', 'class_stream_id', 'term_id', 'role'],
                'teacher_classes_unique_assignment'
            );

            $table->index(['academic_year_id', 'term_id']);
            $table->index(['teacher_id', 'is_active']);
            $table->index(['class_id', 'class_stream_id']);
            $table->index('level');
            $table->index('role');
            $table->index('assigned_date');
            $table->index('end_date');
        });

        Schema::create('teacher_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')
                ->nullable()
                ->constrained('academic_years')
                ->nullOnDelete();
            $table->foreignId('term_id')
                ->nullable()
                ->constrained('terms')
                ->nullOnDelete();
            $table->foreignId('class_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('class_stream_id')->nullable()->constrained()->onDelete('cascade');
            $table->enum('role', [
                'primary',
                'secondary',
                'assistant',
                'substitute'
            ])->default('primary');
            $table->boolean('can_grade')->default(true);
            $table->boolean('can_finalize_grades')->default(false);
            $table->integer('allocated_hours')->nullable();
            $table->string('teaching_schedule')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->foreignId('assigned_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();

            // Unique and indexes
            $table->unique([
                'teacher_id',
                'subject_id',
                'class_id',
                'class_stream_id',
                'term_id'
            ], 'teacher_subjects_unique_assignment');

            $table->index(['academic_year_id', 'term_id']);
            $table->index(['teacher_id', 'is_active']);
            $table->index(['class_id', 'class_stream_id']);
            $table->index('role');
            $table->index(['subject_id', 'class_id']);
            $table->index(['teacher_id', 'class_id']);
            $table->index('allocated_hours');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_subjects');
        Schema::dropIfExists('teacher_classes');
        Schema::dropIfExists('teachers');
    }
};