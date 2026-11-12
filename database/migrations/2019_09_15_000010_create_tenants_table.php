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

            $table->string('name');
            $table->string('tenancy_db_connection')->nullable();
            $table->string('tenancy_db_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
             $table->string('contact_name')->nullable();

            $table->enum('status', [
                'pending',
                'active',
                'suspended',
                'cancelled'
            ])->default('pending')->index();
            $table->boolean('is_active')->default(false)->index();

            $table->unsignedInteger('student_count')->default(0);

            $table->json('data')->nullable();

            $table->foreignId('county_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('constituency_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('ward_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('location_id')->nullable()->constrained()->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();
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
