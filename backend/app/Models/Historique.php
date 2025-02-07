<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Historique extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'historiques';

    protected $fillable = [
        'user_id',
        'nom',
        'prenom',
        'action',
        'date',
        'heure',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'user_id');
    }
}
