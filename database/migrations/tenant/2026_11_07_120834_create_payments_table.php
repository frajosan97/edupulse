<?php
// database/migrations/2025_01_01_000005_create_payments_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->string('payment_number')->unique();   // PAY-2025-000456
            $table->string('receipt_number')->nullable()->unique();

            $table->foreignId('student_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('academic_year_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('term_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();

            $table->string('currency', 3)->default('KES');
            $table->decimal('amount', 12, 2);             // gross amount received
            $table->decimal('amount_allocated', 12, 2)->default(0);   // sum of allocations
            $table->decimal('amount_unallocated', 12, 2)->default(0); // overpayment / credit

            // cash | bank_transfer | mobile_money | cheque | card | online
            $table->string('method', 32)->index();

            $table->string('reference')->nullable();      // M-Pesa code, cheque no, bank ref
            $table->string('payer_name')->nullable();
            $table->string('payer_phone')->nullable();
            $table->string('payer_email')->nullable();

            $table->timestamp('paid_at')->index();
            $table->date('value_date')->nullable();

            // pending | confirmed | voided | refunded
            $table->string('status', 24)->default('confirmed')->index();

            // Void handling — regulators require this over deletion
            $table->timestamp('voided_at')->nullable();
            $table->foreignId('voided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('void_reason')->nullable();

            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();

            // Attach proof — bank slip scan, screenshot
            $table->string('attachment_path')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['student_id', 'status']);
            $table->index(['term_id', 'status']);
            $table->index(['method', 'status']);
        });

        Schema::create('payment_allocations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('invoice_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('invoice_item_id')->nullable()->constrained()->nullOnDelete();

            $table->decimal('amount', 12, 2);

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['payment_id', 'invoice_id', 'invoice_item_id'], 'payment_allocations_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_allocations');
        Schema::dropIfExists('payments');
    }
};