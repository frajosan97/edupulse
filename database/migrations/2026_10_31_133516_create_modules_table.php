<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code')->unique();
            $table->integer('order_number')->nullable();
            $table->string('icon')->nullable();
            $table->text('description')->nullable();
            $table->decimal('base_price', 10, 2);
            $table->unsignedInteger('included_students')->default(200);
            $table->decimal('per_student_price', 10, 2)->default(30.00);
            $table->decimal('min_bill_amount', 10, 2);
            $table->decimal('max_bill_amount', 10, 2)->default(100000.00);
            $table->string('period')->default('yearly');
            $table->boolean('featured')->default(false);
            $table->boolean('is_active')->default(true)->index();
            $table->json('features')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('tenant_module', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('student_count')->nullable();
            $table->enum('status', [
                'pending',
                'active',
                'inactive',
                'suspended'
            ])->default('active');
            $table->enum('billing_cycle', [
                'monthly',
                'quarterly',
                'annual'
            ])->default('annual');
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamp('billing_start_date')->nullable();
            $table->timestamp('billing_end_date')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'module_id']);
            $table->index(['tenant_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_module');
        Schema::dropIfExists('modules');
    }
};