<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('investments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();

            // Monetary values are stored as integer minor units (centavos).
            $table->unsignedBigInteger('amount')->comment('principal, in cents');
            $table->char('currency', 3)->default('BRL');

            // Business creation date (backdatable) — distinct from created_at.
            $table->date('invested_at');
            $table->string('status')->default('active')->index();

            // Withdrawal snapshot — frozen figures, all nullable until withdrawn.
            $table->date('withdrawn_at')->nullable();
            $table->string('withdrawal_bracket')->nullable();
            $table->decimal('withdrawal_tax_rate', 6, 4)->nullable();
            $table->unsignedBigInteger('withdrawal_gross')->nullable()->comment('cents');
            $table->unsignedBigInteger('withdrawal_gains')->nullable()->comment('cents');
            $table->unsignedBigInteger('withdrawal_tax')->nullable()->comment('cents');
            $table->unsignedBigInteger('withdrawal_net')->nullable()->comment('cents');

            $table->timestamps();

            $table->index(['owner_id', 'invested_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investments');
    }
};
