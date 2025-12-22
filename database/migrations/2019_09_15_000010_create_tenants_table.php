<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTenantsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->string('id')->primary();

            // Start custom fields
            $table->string('name')->nullable();
            $table->json('database')->nullable()->unique();
            $table->string('email')->nullable()->unique();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('logo')->nullable()->default('default.png');
            $table->foreignId('plan_id')->nullable()->constrained()->cascadeOnDelete();
            $table->date('expires_at')->nullable();
            $table->foreignId('county_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('constituency_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('ward_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('location_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['active', 'suspended', 'deactivated'])->default('active');
            $table->boolean('is_active')->default(true);
            // End custom fields

            $table->json('data')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
}
