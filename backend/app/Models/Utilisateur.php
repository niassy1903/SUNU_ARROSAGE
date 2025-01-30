<?php

// app/Models/Utilisateur.php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Utilisateur extends Model
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
}
