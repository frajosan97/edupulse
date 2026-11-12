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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('curriculum_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('pathway_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('class_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('class_stream_id')->nullable()->constrained()->onDelete('set null');
            $table->string('admission_number')->unique();
            $table->date('date_of_birth')->nullable();
            $table->string('assessment_number')->nullable();
            $table->decimal('points', 8, 2)->nullable();
            $table->integer('kcpe_marks')->nullable();
            $table->date('admission_date');
            $table->timestamps();
            $table->softDeletes();

            // Optimized indexes
            $table->index('admission_number');
            $table->index('class_id');
            $table->index('class_stream_id');
            $table->index('curriculum_id');
            $table->index('pathway_id');
            $table->index('admission_date');
        });

        Schema::create('parent_student', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->enum('relationship_type', [
                'mother',
                'father',
                'guardian',
                'other'
            ])->default('guardian');
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['parent_id', 'student_id']);
            $table->index(['student_id', 'parent_id']);
            $table->index('is_primary');
        });

        Schema::create('student_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->nullable()->constrained()->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['student_id', 'subject_id', 'class_id']);
            $table->index(['student_id', 'is_active']);
            $table->index(['subject_id', 'is_active']);
            $table->index(['class_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_subjects');
        Schema::dropIfExists('parent_student');
        Schema::dropIfExists('students');
    }
};
