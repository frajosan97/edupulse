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
        /**
         * Grading Systems (Works for both 8-4-4 and CBC)
         */
        Schema::create('grading_systems', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->enum('type', ['percentage', 'letter', 'gpa', 'level', 'custom'])->default('percentage'); // CBC uses "level"
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('grade_scales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grading_system_id')->constrained()->onDelete('cascade');
            $table->string('name'); // e.g. "A", "Level 4", "Exceeds Expectation"
            $table->string('code')->nullable();
            $table->decimal('min_score', 5, 2)->nullable(); // for 8-4-4
            $table->decimal('max_score', 5, 2)->nullable(); // for 8-4-4
            $table->decimal('grade_point', 5, 2)->nullable(); // GPA if used
            $table->string('description')->nullable(); // CBC descriptors
            $table->string('remark')->nullable();
            $table->integer('display_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['grading_system_id', 'name']);
        });

        /**
         * Subject Grouping
         */
        Schema::create('subject_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. Sciences, Languages
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->foreignId('coordinator_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('grading_system_id')->nullable()->constrained('grading_systems')->onDelete('set null');
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        /**
         * Subjects
         */
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('short_name')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('subject_group_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('department_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('grading_system_id')->nullable()->constrained('grading_systems')->onDelete('set null');
            $table->enum('type', ['core', 'elective', 'optional', 'extracurricular'])->default('core');
            $table->boolean('has_theory')->default(true);
            $table->boolean('has_practical')->default(false);
            $table->integer('theory_hours')->nullable();
            $table->integer('practical_hours')->nullable();
            $table->decimal('passing_score', 5, 2)->nullable(); // 8-4-4 use
            $table->decimal('max_score', 5, 2)->default(100);
            $table->decimal('theory_weightage', 5, 2)->nullable();
            $table->decimal('practical_weightage', 5, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });

        /**
         * Teachers assigned to subjects
         */
        Schema::create('subject_teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('class_id')->nullable()->constrained()->onDelete('cascade');
            $table->enum('role', ['primary', 'secondary', 'assistant', 'substitute'])->default('primary');
            $table->boolean('can_grade')->default(true);
            $table->boolean('can_finalize_grades')->default(false);
            $table->integer('allocated_hours')->nullable();
            $table->string('teaching_schedule')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->foreignId('assigned_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['subject_id', 'teacher_id', 'class_id']);
        });

        /**
         * CBC: Competencies (Strands & Sub-strands)
         */
        Schema::create('competencies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->string('strand'); // Broad area
            $table->string('sub_strand')->nullable(); // Specific skill/content
            $table->string('learning_outcome'); // Expected outcome
            $table->timestamps();
        });

        /**
         * CBC: Performance Levels (rubric descriptors)
         */
        Schema::create('performance_levels', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. "Exceeds Expectation"
            $table->string('code')->nullable(); // e.g. Level 4
            $table->string('description')->nullable();
            $table->integer('level_order')->default(0);
            $table->timestamps();
        });

        /**
         * Assessments (works for both 8-4-4 and CBC)
         */
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['exam', 'assignment', 'project', 'observation', 'practical']);
            $table->foreignId('competency_id')->nullable()->constrained()->onDelete('set null'); // CBC only
            $table->foreignId('performance_level_id')->nullable()->constrained()->onDelete('set null'); // CBC rubric
            $table->decimal('score', 5, 2)->nullable(); // 8-4-4 marks
            $table->string('remark')->nullable();
            $table->foreignId('graded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });

        /**
         * Student ↔ Subject Enrollment
         */
        Schema::create('student_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->nullable()->constrained()->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['student_id', 'subject_id', 'class_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_subjects');
        Schema::dropIfExists('assessments');
        Schema::dropIfExists('performance_levels');
        Schema::dropIfExists('competencies');
        Schema::dropIfExists('subject_teachers');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('subject_groups');
        Schema::dropIfExists('grade_scales');
        Schema::dropIfExists('grading_systems');
    }
};
