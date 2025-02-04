<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class CodeSecretNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $code_secret;
    protected $nom;
    protected $prenom;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($code_secret, $prenom, $nom)
    {
        $this->code_secret = $code_secret;
        $this->prenom = $prenom;
        $this->nom = $nom;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $frontendUrl = config('app.frontend_url');

        return (new MailMessage)
                    ->subject('Votre code secret')
                    ->line('Bonjour ' . $this->nom . ' ' . $this->prenom . ',')
                    ->line('Votre code secret pour vous connecter est : ' . $this->code_secret)
                    ->action('Se connecter', $frontendUrl);
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            //
        ];
    }
}
