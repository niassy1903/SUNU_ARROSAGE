<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Notifications\Notifiable;

class Utilisateur extends Model implements JWTSubject
{
    use Notifiable;

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
        'email',
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

    // Méthode pour obtenir l'adresse email pour les notifications
    public function routeNotificationForMail()
    {
        return $this->email;
    }
}
