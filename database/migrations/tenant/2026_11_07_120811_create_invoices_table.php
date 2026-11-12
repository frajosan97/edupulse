<?php
// database/migrations/2025_01_01_000003_create_invoices_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();

            $table->string('invoice_number')->unique();   // INV-2025-000123

            $table->foreignId('student_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('academic_year_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('term_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('fee_structure_id')->nullable()->constrained()->nullOnDelete();

            // Snapshot — so the invoice is reproducible even if class changes later
            $table->foreignId('class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->foreignId('class_stream_id')->nullable()->constrained('class_streams')->nullOnDelete();

            $table->string('currency', 3)->default('KES');

            // Money — all in smallest unit?  No. Use decimal(12,2).
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_total', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->decimal('balance', 12, 2)->default(0);

            $table->date('issue_date');
            $table->date('due_date');

            // draft | issued | partially_paid | paid | overdue | voided
            $table->string('status', 24)->default('draft')->index();

            $table->timestamp('voided_at')->nullable();
            $table->foreignId('voided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('void_reason')->nullable();

            $table->text('notes')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['student_id', 'status']);
            $table->index(['term_id', 'status']);
            $table->index(['due_date', 'status']);
        });

        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->foreignId('fee_structure_item_id')->nullable()->constrained()->nullOnDelete();

            $table->string('name');                          // copied for snapshot
            $table->string('category')->nullable();

            $table->decimal('unit_price', 12, 2);
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);

            $table->text('notes')->nullable();
            $table->unsignedInteger('sort_order')->default(0);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('invoices');
    }
};