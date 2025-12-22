<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        /**
         * Academic Years (Normalize academic_year)
         */
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

        /**
         * Terms (belong to academic year)
         */
        Schema::create('terms', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. Term 1, Term 2
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('deleted_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
        });

        /**
         * Exams
         */
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('term_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code')->unique();
            $table->string('description')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_published')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('deleted_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
        });

        /**
         * Pivot: Exams ↔ Classes
         */
        Schema::create('class_exam', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['exam_id', 'class_id']);
        });

        /**
         * Pivot: Exams ↔ Streams
         */
        Schema::create('exam_stream', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->onDelete('cascade');
            $table->foreignId('stream_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['exam_id', 'stream_id']);
        });

        /**
         * Results (Flexible for 8-4-4 + CBC)
         */
        Schema::create('results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_stream_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');

            // 8-4-4 fields
            $table->decimal('pp_1', 10, 2)->nullable();
            $table->decimal('pp_1_outof', 10, 2)->nullable();
            $table->decimal('pp_2', 10, 2)->nullable();
            $table->decimal('pp_2_outof', 10, 2)->nullable();
            $table->decimal('pp_3', 10, 2)->nullable();
            $table->decimal('pp_3_outof', 10, 2)->nullable();
            $table->decimal('score', 10, 2)->nullable();
            $table->decimal('score_outof', 10, 2)->nullable();
            $table->decimal('points', 10, 0)->nullable();
            $table->string('grade')->nullable();

            // CBC fields
            $table->foreignId('competency_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('performance_level_id')->nullable()->constrained()->onDelete('set null');

            $table->text('remarks')->nullable();
            $table->boolean('is_published')->default(false);

            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('deleted_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['exam_id', 'student_id', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('results');
        Schema::dropIfExists('exam_stream');
        Schema::dropIfExists('class_exam');
        Schema::dropIfExists('exams');
        Schema::dropIfExists('terms');
        Schema::dropIfExists('academic_years');
    }
};
