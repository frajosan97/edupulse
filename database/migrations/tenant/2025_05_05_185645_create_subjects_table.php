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
            $table->enum('type', ['844', 'cbc',])->default('844');
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('name');
            $table->index('type');
            $table->index(['is_default', 'is_active']);
        });

        Schema::create('grade_scales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grading_system_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code')->nullable();
            $table->decimal('min_score', 5, 2)->nullable();
            $table->decimal('max_score', 5, 2)->nullable();
            $table->decimal('grade_point', 5, 2)->nullable();
            $table->string('description')->nullable();
            $table->string('remark')->nullable();
            $table->string('swahili_remark')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_passing')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['grading_system_id', 'name']);
            $table->index(['grading_system_id', 'display_order']);
            $table->index(['min_score', 'max_score']);
        });

        /**
         * Subjects - Now directly linked to curriculum and pathway
         */
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('short_name')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('curriculum_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('pathway_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->foreignId('grading_system_id')->nullable()->constrained('grading_systems')->onDelete('set null');
            $table->enum('type', [
                'core',
                'elective',
                'optional',
                'extracurricular'
            ])->default('core');
            $table->boolean('has_theory')->default(true);
            $table->boolean('has_practical')->default(false);
            $table->integer('theory_hours')->nullable();
            $table->integer('practical_hours')->nullable();
            $table->decimal('passing_score', 5, 2)->nullable();
            $table->decimal('max_score', 5, 2)->default(100);
            $table->decimal('theory_weightage', 5, 2)->nullable();
            $table->decimal('practical_weightage', 5, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('name');
            $table->index('curriculum_id');
            $table->index('pathway_id');
            $table->index('department_id');
            $table->index('type');
            $table->index(['is_active', 'type']);
            $table->index(['curriculum_id', 'pathway_id']);
            $table->index(['curriculum_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('grade_scales');
        Schema::dropIfExists('grading_systems');
    }
};