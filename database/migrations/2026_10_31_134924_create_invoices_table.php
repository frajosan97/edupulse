<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | INVOICES
        |--------------------------------------------------------------------------
        */

        Schema::create('invoices', function (Blueprint $table) {
            $table->id();

            // Tenant ownership
            $table->string('tenant_id');

            $table->foreign('tenant_id')
                ->references('id')
                ->on('tenants')
                ->restrictOnDelete();

            // Invoice identification
            $table->string('invoice_number');

            // Billing period
            $table->date('period_start');
            $table->date('period_end');

            // Invoice dates
            $table->date('invoice_date');
            $table->date('due_date');

            // Currency
            $table->char('currency', 3)->default('KES');

            // Financial breakdown
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('discount_total', 15, 2)->default(0);
            $table->decimal('tax_total', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);

            // Payment tracking
            $table->decimal('amount_paid', 15, 2)->default(0);

            $table->decimal('balance_due', 15, 2)
                ->virtualAs('GREATEST(total - amount_paid, 0)');

            // Invoice lifecycle
            $table->enum('status', [
                'draft',
                'issued',
                'partially_paid',
                'paid',
                'cancelled',
            ])->default('draft');

            // Additional information
            $table->text('description')->nullable();

            // Lifecycle timestamps
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->timestamps();

            // Soft deletion is intended for drafts and administrative recovery.
            $table->softDeletes();

            // Invoice number only needs to be unique within a tenant.
            $table->unique(
                ['tenant_id', 'invoice_number'],
                'invoices_tenant_number_unique'
            );

            // Query optimization
            $table->index(
                ['tenant_id', 'status'],
                'invoices_tenant_status_index'
            );

            $table->index(
                ['tenant_id', 'due_date'],
                'invoices_tenant_due_date_index'
            );

            $table->index(
                ['tenant_id', 'invoice_date'],
                'invoices_tenant_date_index'
            );
        });


        /*
        |--------------------------------------------------------------------------
        | INVOICE ITEMS
        |--------------------------------------------------------------------------
        */

        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('invoice_id')
                ->constrained('invoices')
                ->cascadeOnDelete();

            // Historical description: never depend on the current module name.
            $table->string('description');

            // Optional relationship to a SaaS module.
            $table->foreignId('module_id')
                ->nullable()
                ->constrained('modules')
                ->nullOnDelete();

            // Quantity and pricing
            $table->decimal('quantity', 12, 3)->default(1);

            $table->decimal('unit_price', 15, 2)->default(0);

            // Financial breakdown
            $table->decimal('subtotal', 15, 2)->default(0);

            $table->decimal('discount_amount', 15, 2)->default(0);

            $table->decimal('tax_rate', 7, 4)->default(0);

            $table->decimal('tax_amount', 15, 2)->default(0);

            $table->decimal('total', 15, 2)->default(0);

            $table->timestamps();

            $table->index('invoice_id', 'invoice_items_invoice_index');
            $table->index('module_id', 'invoice_items_module_index');
        });


        /*
        |--------------------------------------------------------------------------
        | PAYMENT METHODS
        |--------------------------------------------------------------------------
        */

        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();

            // Machine-readable identifier
            $table->string('code')->unique();

            // Display information
            $table->string('name');
            $table->string('icon')->nullable();

            // Availability
            $table->boolean('is_active')->default(true);

            $table->unsignedInteger('display_order')->default(0);

            // Provider configuration
            $table->json('settings')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(
                ['is_active', 'display_order'],
                'payment_methods_active_order_index'
            );
        });


        /*
        |--------------------------------------------------------------------------
        | PAYMENTS
        |--------------------------------------------------------------------------
        */

        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            // Associated invoice
            $table->foreignId('invoice_id')
                ->constrained('invoices')
                ->restrictOnDelete();

            // Payment method can be retired without deleting historical payments.
            $table->foreignId('payment_method_id')
                ->nullable()
                ->constrained('payment_methods')
                ->nullOnDelete();

            // Payment provider
            $table->string('provider')->nullable();

            // Financial information
            $table->decimal('amount', 15, 2);

            $table->char('currency', 3)->default('KES');

            $table->date('payment_date');

            // Payment lifecycle
            $table->enum('status', [
                'pending',
                'completed',
                'failed',
                'refunded',
                'cancelled',
            ])->default('pending');

            // Provider transaction identification
            $table->string('provider_transaction_id')->nullable();

            $table->string('reference')->nullable();

            // Prevent duplicate processing of payment requests.
            $table->string('idempotency_key')->nullable()->unique();

            // Payer information
            $table->string('payer_name')->nullable();

            // Payment provider response
            $table->json('payment_details')->nullable();

            // Additional application information
            $table->json('metadata')->nullable();

            $table->text('notes')->nullable();

            // Balance snapshots for reconciliation
            $table->decimal('invoice_balance_before', 15, 2)->nullable();

            $table->decimal('invoice_balance_after', 15, 2)->nullable();

            // Confirmation information
            $table->string('confirmed_by')->nullable();

            $table->timestamp('confirmed_at')->nullable();

            $table->timestamp('processed_at')->nullable();

            $table->timestamps();

            // Useful lookup indexes
            $table->index('invoice_id', 'payments_invoice_index');

            $table->index(
                ['provider', 'provider_transaction_id'],
                'payments_provider_transaction_index'
            );

            $table->index('reference', 'payments_reference_index');

            $table->index(
                ['invoice_id', 'status'],
                'payments_invoice_status_index'
            );

            $table->index('payment_date', 'payments_date_index');
        });


        /*
        |--------------------------------------------------------------------------
        | REFUNDS
        |--------------------------------------------------------------------------
        */

        Schema::create('refunds', function (Blueprint $table) {
            $table->id();

            // Original payment
            $table->foreignId('payment_id')
                ->constrained('payments')
                ->restrictOnDelete();

            // Refund provider
            $table->string('provider')->nullable();

            // Refund identification
            $table->string('provider_refund_id')->nullable();

            // Prevent duplicate refund requests.
            $table->string('idempotency_key')->nullable()->unique();

            // Refund amount
            $table->decimal('amount', 15, 2);

            $table->char('currency', 3)->default('KES');

            // Refund lifecycle
            $table->enum('status', [
                'pending',
                'completed',
                'failed',
                'cancelled',
            ])->default('pending');

            // Reason and additional information
            $table->string('reason')->nullable();

            $table->text('notes')->nullable();

            $table->json('metadata')->nullable();

            // Processing information
            $table->string('processed_by')->nullable();

            $table->timestamp('processed_at')->nullable();

            $table->timestamps();

            $table->index('payment_id', 'refunds_payment_index');

            $table->index(
                ['provider', 'provider_refund_id'],
                'refunds_provider_reference_index'
            );

            $table->index(
                ['payment_id', 'status'],
                'refunds_payment_status_index'
            );
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('refunds');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('payment_methods');
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('invoices');
    }
};
