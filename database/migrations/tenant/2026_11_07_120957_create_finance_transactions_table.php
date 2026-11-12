<?php
// database/migrations/2025_01_01_000011_create_finance_transactions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('finance_transactions', function (Blueprint $table) {
            $table->id();

            // inflow | outflow
            $table->string('direction', 8)->index();
            $table->string('source_type', 32)->index();     // payment | expense
            $table->unsignedBigInteger('source_id');
            $table->string('source_number')->nullable();

            $table->foreignId('student_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('vendor_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('academic_year_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('term_id')->nullable()->constrained()->nullOnDelete();

            $table->string('currency', 3)->default('KES');
            $table->decimal('amount', 12, 2);

            $table->string('method', 32)->nullable();
            $table->string('category')->nullable();          // from ExpenseCategory or payment method
            $table->text('description')->nullable();

            $table->date('transaction_date')->index();

            $table->timestamps();

            $table->index(['source_type', 'source_id']);
            $table->index(['direction', 'transaction_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('finance_transactions');
    }
};