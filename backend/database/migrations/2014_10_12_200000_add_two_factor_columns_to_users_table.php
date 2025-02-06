<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('two_factor_secret')->nullable();  // Ajout de la colonne pour le secret 2FA
            $table->text('two_factor_recovery_codes')->nullable();  // Ajout de la colonne pour les codes de récupération 2FA
            $table->timestamp('two_factor_confirmed_at')->nullable();  // Ajout de la colonne pour confirmer la 2FA
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'two_factor_secret',  // Suppression de la colonne
                'two_factor_recovery_codes',  // Suppression de la colonne
                'two_factor_confirmed_at',  // Suppression de la colonne
            ]);
        });
    }
};
