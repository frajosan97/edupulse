<?php
// database/migrations/2025_01_01_000010_create_discounts_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('discounts', function (Blueprint $table) {
            $table->id();

            $table->string('name');                       // "Sibling Discount", "Bursary 2025"
            $table->string('code')->nullable()->unique();

            // fixed | percentage
            $table->string('type', 24);
            $table->decimal('value', 12, 2);

            // applies_to: all | tuition_only | specific_category
            $table->string('applies_to', 32)->default('all');
            $table->string('category')->nullable();

            $table->foreignId('academic_year_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('term_id')->nullable()->constrained()->nullOnDelete();

            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();

            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });

        // Pivot — discounts awarded to specific students
        Schema::create('discount_student', function (Blueprint $table) {
            $table->id();
            $table->foreignId('discount_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('invoice_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 12, 2)->nullable();  // for fixed overrides
            $table->foreignId('awarded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('awarded_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discount_student');
        Schema::dropIfExists('discounts');
    }
};