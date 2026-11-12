<?php
// database/migrations/2025_01_01_000007_create_expense_categories_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('expense_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();          // Utilities, Salaries, Maintenance
            $table->string('slug')->unique();
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->id();

            $table->string('expense_number')->unique();    // EXP-2025-000789

            $table->foreignId('academic_year_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('term_id')->nullable()->constrained()->cascadeOnUpdate()->restrictOnDelete();

            $table->foreignId('expense_category_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('vendor_id')->nullable()->constrained()->nullOnDelete();

            $table->string('currency', 3)->default('KES');
            $table->decimal('amount', 12, 2);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);

            $table->string('description');
            $table->string('reference')->nullable();       // invoice no / receipt no

            $table->date('expense_date');
            $table->date('paid_date')->nullable();

            // pending | approved | paid | rejected | voided
            $table->string('status', 24)->default('pending')->index();

            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();

            $table->string('attachment_path')->nullable();

            $table->timestamp('voided_at')->nullable();
            $table->foreignId('voided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('void_reason')->nullable();

            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['term_id', 'status']);
            $table->index(['expense_category_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('expense_categories');
    }
};