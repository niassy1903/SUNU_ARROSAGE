<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Historique extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'historiques';

    protected $fillable = [
        'utilisateur_id',
        'nom',
        'prenom',
        'action',
        'date_heure',
    ];

    protected $casts = [
        'action' => 'enum',
    ];

    protected $enums = [
        'action' => [
            'créer', 'modifier', 'supprimer', 'activer_bouton_arrosage', 'planifier_arrosage'
        ],
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }
}

