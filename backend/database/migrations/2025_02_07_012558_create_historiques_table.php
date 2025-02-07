<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateHistoriquesTable extends Migration
{
    public function up()
    {
        Schema::connection('mongodb')->create('historiques', function (Blueprint $table) { //Spécifie que cette migration est pour la connexion MongoDB.
            $table->id();
            $table->unsignedBigInteger('utilisateur_id');
            $table->string('nom');
            $table->string('prenom');
            $table->enum('action', ['créer', 'modifier', 'supprimer', 'activer_bouton_arrosage', 'planifier_arrosage']);
            $table->timestamp('date_heure');
            $table->foreign('utilisateur_id')->references('id')->on('utilisateurs')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::connection('mongodb')->dropIfExists('historiques');
    }
}

