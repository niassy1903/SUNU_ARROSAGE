import { Component, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilisateurService } from '../utilisateur.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';

// Décorateur @Component pour définir le composant Angular
@Component({
  selector: 'app-loginbycode', // Sélecteur pour utiliser ce composant dans le template
  standalone: true, 
  imports: [CommonModule, FormsModule, HttpClientModule], 
  templateUrl: './loginbycode.component.html', 
  styleUrls: ['./loginbycode.component.css'], 
  providers: [UtilisateurService], // Fournisseurs de services
})
export class LoginbycodeComponent implements AfterViewInit {
  // Référence aux éléments d'entrée du code dans le template
  @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef>;

  // Tableau pour stocker les chiffres du code saisi
  codeDigits: string[] = ['', '', '', ''];
  // Tableau pour masquer les chiffres du code (affichage visuel)
  maskedDigits: string[] = ['', '', '', ''];

  // Tableau pour stocker les erreurs supplémentaires
  additionalErrors: string[] = [];

  // Variables pour gérer les erreurs et l'état de connexion
  errorMessage: string = '';
  shakeInputs: boolean = false;  //secousse des inputs
  inputError: boolean = false;
  isLoggedIn: boolean = false;

  // Variables pour gérer les tentatives de connexion et le blocage
  maxAttempts: number = 3;
  currentAttempts: number = 0;
  isBlocked: boolean = false;
  blockDuration: number = 30; // Durée de blocage en secondes
  remainingBlockTime: number = 0; // Temps restant avant la fin du blocage
  blockTimer: any; // Timer pour le compte à rebours du blocage
  countdownProgress: number = 0; // Progression du compte à rebours

  // Connexion WebSocket pour recevoir les entrées du clavier en temps réel
  socket: Socket;

  // Constructeur du composant
  constructor(
    public utilisateurService: UtilisateurService, // Service pour gérer les utilisateurs
    private router: Router // Service pour la navigation
  ) {
    // Vérifier si l'utilisateur est déjà connecté
    this.isLoggedIn = !!localStorage.getItem('token');
    this.checkPreviousBlock(); // Vérifier si l'utilisateur était bloqué précédemment

    // Initialiser la connexion WebSocket
    this.socket = io('http://localhost:5000');

    // Écouter les événements du serveur
    this.socket.on('login_success', (data) => this.handleLoginSuccess(data));
    this.socket.on('login_failed', () => this.handleLoginFailure());
    this.socket.on('login_blocked', (data) => this.handleLoginBlocked(data));
    this.socket.on('login_unblocked', () => this.handleLoginUnblocked());
    this.socket.on('code_secret', (code: string) => this.handleKeypadInput(code));
  }

  // Méthode appelée après l'initialisation de la vue
  ngAfterViewInit() {
    this.focusFirstInput(); // Mettre le focus sur le premier champ d'entrée

    // Écouter les événements de l'UID de la carte
    this.socket.on('card_uid', (uid: string) => {
      this.utilisateurService.loginByCard(uid).subscribe(
        (response) => this.handleLoginSuccess(response),
        (error) => {
          console.error('Erreur de connexion par carte:', error);
          this.handleLoginFailure();
        }
      );
    });
  }

  // Gestionnaire d'événements pour les entrées du code
  onCodeInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Limiter la longueur de la valeur à 1 caractère
    if (value.length > 1) {
      value = value.slice(-1);
    }

    // Mettre à jour les chiffres du code et les masquer
    this.codeDigits[index] = value;
    if (value) {
      this.maskedDigits[index] = value;
      input.value = value;

      // Masquer le chiffre après un court délai
      setTimeout(() => {
        this.maskedDigits[index] = '•';
        input.value = '•';
      }, 500);

      // Passer au champ d'entrée suivant si ce n'est pas le dernier
      if (index < 3) {
        const nextInput = this.codeInputs.toArray()[index + 1];
        nextInput?.nativeElement.focus();
      }
    } else {
      this.maskedDigits[index] = '';
    }

    // Vérifier le code si tous les chiffres sont saisis
    if (this.codeDigits.every(digit => digit !== '')) {
      this.verifyCode();
    }
  }

  // Gestionnaire d'événements pour les touches du clavier
  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace') {
      if (!this.codeDigits[index]) {
        if (index > 0) {
          const prevInput = this.codeInputs.toArray()[index - 1];
          prevInput?.nativeElement.focus();
          this.codeDigits[index - 1] = '';
          this.maskedDigits[index - 1] = '';
        }
      } else {
        this.codeDigits[index] = '';
        this.maskedDigits[index] = '';
      }
    }
  }

  // Vérifier si l'utilisateur était bloqué précédemment
  checkPreviousBlock() {
    const blockedUntil = localStorage.getItem('loginBlockedUntil');
    if (blockedUntil) {
      const blockEndTime = parseInt(blockedUntil, 10);
      const currentTime = new Date().getTime();

      if (currentTime < blockEndTime) {
        this.isBlocked = true;
        this.remainingBlockTime = Math.ceil((blockEndTime - currentTime) / 1000);
        this.startBlockTimer();
      } else {
        localStorage.removeItem('loginBlockedUntil');
        this.resetAttempts();
      }
    }
  }

  // Gérer les entrées du clavier (Keypad)
  handleKeypadInput(key: string) {
    if (this.isBlocked) return;

    const currentIndex = this.codeDigits.findIndex(digit => digit === '');

    if (currentIndex !== -1 && currentIndex < 4) {
      this.codeDigits[currentIndex] = key;
      this.maskedDigits[currentIndex] = key;

      const currentInput = this.codeInputs.toArray()[currentIndex];
      if (currentInput) {
        currentInput.nativeElement.value = key;

        setTimeout(() => {
          currentInput.nativeElement.value = '•';

          if (currentIndex < 3) {
            const nextInput = this.codeInputs.toArray()[currentIndex + 1];
            if (nextInput) {
              nextInput.nativeElement.focus();
            }
          } else {
            this.verifyCode();
          }
        }, 500);
      }
    }
  }

  // Mettre à jour le focus des champs d'entrée
  updateInputFocus(index: number) {
    if (index < 3) {
      const nextInput = this.codeInputs.toArray()[index + 1];
      nextInput?.nativeElement.focus();
    }
  }

  // Vérifier le code saisi
  verifyCode() {
    if (this.isBlocked) return;

    const code = this.codeDigits.join('');
    if (code.length < 4) return;

    this.utilisateurService.loginByCode(code).subscribe(
      (response) => this.handleLoginSuccess(response),
      () => this.handleLoginFailure()
    );
  }

  // Gérer une connexion réussie
  handleLoginSuccess(response: any) {
    console.log('✅ Connexion réussie:', response);
    if (response.user && response.user.id) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('prenom', response.user.prenom);
      localStorage.setItem('nom', response.user.nom);
      localStorage.setItem('role', response.user.role);
      localStorage.setItem('userId', response.user.id);
      console.log('ID de l\'utilisateur stocké:', response.user.id);
    } else {
      console.error('ID de l\'utilisateur manquant dans la réponse:', response);
    }

    if (response.user.role === 'super_admin' || response.user.role === 'admin_simple') {
      this.router.navigate(['/dashbord']);
    }
  }

  // Gérer un blocage de connexion
  handleLoginBlocked(data: any) {
    this.isBlocked = true;
    this.remainingBlockTime = data.remainingTime;
    this.errorMessage = `🚨 Compte bloqué pendant ${this.remainingBlockTime} secondes.`;

    this.blockTimer = setInterval(() => {
      this.remainingBlockTime--;
      if (this.remainingBlockTime <= 0) {
        clearInterval(this.blockTimer);
        this.handleLoginUnblocked();
      }
    }, 1000);
  }

  // Gérer un échec de connexion
  handleLoginFailure() {
    this.currentAttempts++;
    this.errorMessage = `Code incorrect. Tentatives restantes : ${this.maxAttempts - this.currentAttempts}`;
    this.shakeInputs = true;
    this.inputError = true;

    this.additionalErrors = [
      'Assurez-vous que votre carte ou code est valide.'
    ];

    if (this.currentAttempts >= this.maxAttempts) {
      this.blockUser();
    } else {
      setTimeout(() => {
        this.resetInputs();
        this.shakeInputs = false;
        this.inputError = false;
        this.additionalErrors = [];
      }, 1500);
    }
  }

  // Bloquer l'utilisateur
  blockUser() {
    this.isBlocked = true;
    const blockEndTime = new Date().getTime() + this.blockDuration * 1000;
    localStorage.setItem('loginBlockedUntil', blockEndTime.toString());
    this.remainingBlockTime = this.blockDuration;
    this.startBlockTimer();
  }

  // Démarrer le timer de blocage
  startBlockTimer() {
    this.countdownProgress = 100;
    this.blockTimer = setInterval(() => {
      this.remainingBlockTime--;
      this.countdownProgress = (this.remainingBlockTime / this.blockDuration) * 100;

      if (this.remainingBlockTime <= 0) {
        clearInterval(this.blockTimer);
        this.handleLoginUnblocked();
      }
    }, 1000);
  }

  // Gérer le déblocage de l'utilisateur
  handleLoginUnblocked() {
    this.isBlocked = false;
    this.remainingBlockTime = 0;
    this.currentAttempts = 0;
    this.errorMessage = '';
    localStorage.removeItem('loginBlockedUntil');
    this.resetInputs();
  }

  // Mettre le focus sur le premier champ d'entrée
  focusFirstInput() {
    setTimeout(() => {
      const firstInput = this.codeInputs.first;
      if (firstInput && !this.isBlocked) {
        firstInput.nativeElement.focus();
      }
    }, 0);
  }

  // Réinitialiser les champs d'entrée et les erreurs
  resetInputs() {
    this.codeDigits = ['', '', '', ''];
    this.maskedDigits = ['', '', '', ''];
    this.focusFirstInput();
    this.inputError = false;
    this.additionalErrors = [];
  }

  // Réinitialiser les tentatives de connexion
  resetAttempts() {
    this.currentAttempts = 0;
    this.isBlocked = false;
    this.remainingBlockTime = 0;
    this.errorMessage = '';
    localStorage.removeItem('loginBlockedUntil');
  }

  // Gérer la déconnexion
  logout() {
    this.utilisateurService.logout().subscribe(
      response => {
        console.log('Déconnexion réussie:', response);
        this.router.navigate(['/login-by-code']);
        this.isLoggedIn = false;
      },
      error => {
        console.error('Erreur de déconnexion:', error);
      }
    );
  }
}