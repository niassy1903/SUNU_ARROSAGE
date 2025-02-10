<?php
namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CodeSecretNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $code_secret;
    protected $nom;
    protected $prenom;

    public function __construct($code_secret, $prenom, $nom)
    {
        $this->code_secret = $code_secret;
        $this->prenom = $prenom;
        $this->nom = $nom;
    }

    // ✅ Cette méthode doit être bien définie
    public function via($notifiable)
    {
        return ['mail']; // Envoie uniquement par mail
    }

    public function toMail($notifiable)
    {
        $frontendUrl = config('app.frontend_url');

        return (new MailMessage)
            ->subject('Votre code secret')
            ->greeting('Bonjour ' . $this->nom . ' ' . $this->prenom . ',')
            ->line('Votre code secret pour vous connecter est : **' . $this->code_secret . '**')
            ->action('Se connecter', $frontendUrl)
            ->line('Merci de votre confiance !')
            ->salutation('Cordialement, L\'équipe SUNU_ARROSAGE');
    }

    public function toArray($notifiable)
    {
        return [];
    }
}
