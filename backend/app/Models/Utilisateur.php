<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use MongoDB\Laravel\Eloquent\Model;

class Utilisateur extends Model
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
        'email', // Ajoutez l'email ici
    ];

    /**
     * Route notifications for the mail channel.
     *
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return string
     */
    public function routeNotificationForMail($notification)
    {
        // Retourne l'adresse email de l'utilisateur pour l'envoi de notifications
        return $this->email;
    }
}
