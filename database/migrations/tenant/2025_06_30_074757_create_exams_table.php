<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        /**
         * Exams
         */
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('term_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code')->unique();
            $table->string('description')->nullable();
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->boolean('is_published')->default(false);

            $table->timestamps();
            $table->softDeletes();

            // Performance indexes
            $table->index(['start_date', 'end_date']);
            $table->index('name');
        });

        /**
         * Exam Classes - Enhanced pivot table with stream support
         */
        Schema::create('exam_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_stream_id')->nullable()->constrained()->onDelete('cascade');
            $table->enum('level', ['class', 'stream'])->default('class');
            $table->boolean('is_active')->default(true);
            $table->date('assigned_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            // Unique constraint - prevent duplicates
            $table->unique(
                ['exam_id', 'class_id', 'class_stream_id', 'level'],
                'exam_class_unique'
            );

            // Performance indexes
            $table->index(['exam_id', 'is_active']);
            $table->index(['class_id', 'class_stream_id']);
            $table->index('level');
            $table->index('assigned_date');
            $table->index('end_date');
            $table->index(['exam_id', 'class_id', 'level']);
            $table->index(['exam_id', 'class_stream_id']);
        });

        /**
         * Results - Parent table with aggregated data
         * Now references result_subjects as child records
         */
        Schema::create('results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exam_class_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_stream_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->decimal('total_marks', 10, 2)->default(0);
            $table->decimal('mean_marks', 10, 2)->default(0);
            $table->decimal('total_points', 10, 2)->default(0);
            $table->decimal('mean_points', 10, 2)->default(0);
            $table->string('mean_grade')->nullable();
            $table->unsignedInteger('class_rank')->nullable();
            $table->unsignedInteger('stream_rank')->nullable();
            $table->boolean('is_published')->default(false);

            $table->timestamps();
            $table->softDeletes();

            // One result per student per exam
            $table->unique(['exam_id', 'student_id']);
            $table->index(['exam_id', 'class_id']);
            $table->index(['exam_id', 'class_id', 'class_stream_id']);
            $table->index(['exam_id', 'is_published']);
            $table->index(['student_id', 'is_published']);
            $table->index(['exam_id', 'class_rank']);
            $table->index(['exam_id', 'stream_rank']);
            $table->index(['exam_id', 'total_marks']);
        });

        /**
         * Result Subjects - Child table for per-subject results
         * Each student-exam combination will have one record per subject
         */
        Schema::create('result_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('result_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');

            // 8-4-4 fields (flexible for different subjects)
            $table->decimal('cat_1', 10, 2)->nullable();
            $table->decimal('cat_1_outof', 10, 2)->nullable();
            $table->decimal('cat_2', 10, 2)->nullable();
            $table->decimal('cat_2_outof', 10, 2)->nullable();
            $table->decimal('pp_1', 10, 2)->nullable();
            $table->decimal('pp_1_outof', 10, 2)->nullable();
            $table->decimal('pp_2', 10, 2)->nullable();
            $table->decimal('pp_2_outof', 10, 2)->nullable();
            $table->decimal('pp_3', 10, 2)->nullable();
            $table->decimal('pp_3_outof', 10, 2)->nullable();
            $table->decimal('score', 10, 2)->nullable();
            $table->decimal('score_outof', 10, 2)->nullable();

            // Calculated fields
            $table->decimal('points', 10, 0)->nullable();
            $table->string('grade')->nullable();

            // Optional fields
            $table->integer('rank')->nullable();
            $table->integer('rank_outof')->nullable();
            $table->string('comment')->nullable();

            $table->foreignId('teacher_subject_id')->nullable()->constrained()->nullOnDelete();

            // Status fields
            $table->boolean('is_locked')->default(false);

            $table->timestamps();
            $table->softDeletes();

            // Unique constraint - one subject per result
            $table->unique(
                ['result_id', 'subject_id'],
                'result_subjects_result_id_subject_id_unique'
            );

            // Performance indexes for common queries
            $table->index(['result_id', 'subject_id']);
            $table->index('subject_id');
            $table->index(['score', 'points']);
            $table->index(['created_at', 'result_id']);

            // Composite indexes for grade calculations
            $table->index(['result_id', 'score']);
            $table->index(['result_id', 'points']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('result_subjects');
        Schema::dropIfExists('results');
        Schema::dropIfExists('exam_classes');
        Schema::dropIfExists('exams');
    }
};