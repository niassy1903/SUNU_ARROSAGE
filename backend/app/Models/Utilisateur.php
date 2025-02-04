<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Tymon\JWTAuth\Contracts\JWTSubject;

class Utilisateur extends Model implements JWTSubject
{
    protected $connection = 'mongodb';
    protected $collection = 'utilisateurs';

    protected $fillable = [
        'nom',
        'prenom',
        'matricule',
        'code_secret',
        'carte_rfid',
        'role',
        'telephone',
        'adresse',
    ];

    // Méthode pour obtenir l'identifiant JWT
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    // Méthode pour obtenir les claims personnalisés JWT
    public function getJWTCustomClaims()
    {
        return [];
    }
}
