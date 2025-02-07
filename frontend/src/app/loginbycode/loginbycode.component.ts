import { Component, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilisateurService } from '../utilisateur.service';
import { Router } from '@angular/router';
import { WebsocketService } from '../websocket.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  // Configuration du composant Angular
  selector: 'app-loginbycode',   // Sélecteur HTML pour utiliser ce composant
  standalone: true,              // Indique que le composant est autonome
  imports: [CommonModule, FormsModule, HttpClientModule], // Modules nécessaires
  templateUrl: './loginbycode.component.html',  // Fichier HTML du composant
  styleUrls: ['./loginbycode.component.css'],   // Fichier CSS du composant
  providers: [UtilisateurService],              // Service injecté
})
export class LoginbycodeComponent implements AfterViewInit {
  // Référence aux éléments input du DOM
  @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef>;

  // Tableaux pour gérer la saisie des codes
  codeDigits: string[] = ['', '', '', ''];     // Digits réels 
  maskedDigits: string[] = ['', '', '', ''];   // Digits affichés (masqués)

  // Variables de gestion d'état
  errorMessage: string = '';     // Message d'erreur
  shakeInputs: boolean = false;  // Animation de secousse des inputs
  inputError: boolean = false;   // État d'erreur des inputs
  isLoggedIn: boolean = false;   // État de connexion

  // Configuration des tentatives de connexion
  maxAttempts: number = 3;       // Nombre maximum de tentatives
  currentAttempts: number = 0;   // Nombre de tentatives actuelles
  isBlocked: boolean = false;    // État de blocage
  blockDuration: number = 30;    // Durée de blocage en secondes
  remainingBlockTime: number = 0; // Temps restant avant déblocage
  blockTimer: any;               // Timer de blocage


  // Nouvelle propriété pour la minuterie
  countdownProgress: number = 0;

  constructor(
    public utilisateurService: UtilisateurService,
    private router: Router,
    private websocketService: WebsocketService  // Injection du service WebSocket
  ) {
    // Vérification si localStorage est défini
    if (typeof localStorage !== 'undefined') {
      this.isLoggedIn = !!localStorage.getItem('token');
    } else {
      this.isLoggedIn = false;
    }
    this.checkPreviousBlock();
  }
  
  
 

  // Méthode appelée après l'initialisation de la vue

  ngAfterViewInit() {
    this.focusFirstInput();      // Met le focus sur le premier input

  }
  // Vérifie s'il y a un blocage précédent stocké

  checkPreviousBlock() {
    const blockedUntil = localStorage.getItem('loginBlockedUntil');
    if (blockedUntil) {
      const blockEndTime = parseInt(blockedUntil, 10);
      const currentTime = new Date().getTime();
     
      // Si le blocage est toujours actif

      if (currentTime < blockEndTime) {
        this.isBlocked = true;
               
        // Calcul du temps restant
        this.remainingBlockTime = Math.ceil((blockEndTime - currentTime) / 1000);
        this.startBlockTimer();
      } else {
                // Supprime le blocage expiré

        localStorage.removeItem('loginBlockedUntil');
        this.resetAttempts();
      }
    }
  }

  startBlockTimer() {   // Démarre le timer de blocage

    // Réinitialise la progression
    this.countdownProgress = 100;

    this.blockTimer = setInterval(() => {
      this.remainingBlockTime--;
      
      // Calcul de la progression de la minuterie
      this.countdownProgress = (this.remainingBlockTime / this.blockDuration) * 100;
  
      // Démarre le timer de blocage

      if (this.remainingBlockTime <= 0) {
        this.stopBlockTimer();
      }
    }, 1000);
  }
  // Arrête le timer de blocage

  stopBlockTimer() {
    if (this.blockTimer) {
      clearInterval(this.blockTimer);
    }
        // Réinitialise tous les états de blocage

    this.isBlocked = false;
    this.remainingBlockTime = 0;
    this.countdownProgress = 0;
    localStorage.removeItem('loginBlockedUntil');
    this.resetAttempts();
    this.focusFirstInput();
  }

  resetAttempts() {
    this.currentAttempts = 0;
  }

  focusFirstInput() {
    setTimeout(() => {
      const firstInput = this.codeInputs.first;
      if (firstInput && !this.isBlocked) {
        firstInput.nativeElement.focus();
      }
    }, 0);
  }

  resetInputs() {
    this.codeDigits = ['', '', '', ''];
    this.maskedDigits = ['', '', '', ''];

    const inputElements = this.codeInputs.toArray();
    inputElements.forEach((inputRef) => {
      const inputElement = inputRef.nativeElement as HTMLInputElement;
      inputElement.value = '';
    });

    this.focusFirstInput();
    this.errorMessage = '';
    this.shakeInputs = false;
    this.inputError = false;
  }

  verifyCode() {
    // Vérifie si le compte est bloqué
    if (this.isBlocked) {
     // this.errorMessage = `Trop de tentatives. Veuillez attendre ${this.remainingBlockTime} secondes.`;
      return;
    }
  
    // Concatène les digits pour former le code
    const code = this.codeDigits.join('');
    
    // Appel du service d'authentification
    this.utilisateurService.loginByCode(code).subscribe(
      response => {
        // Connexion réussie
        console.log('Connexion réussie:', response);
        
        // Navigation selon le rôle
        if (response.user.role === 'super_admin' || response.user.role === 'admin_simple') {
          this.router.navigate(['/dashbord']);
        }
        
        this.isLoggedIn = true;
        this.resetAttempts();
      },
      error => {
        // Gestion des erreurs de connexion
        console.error('Erreur de connexion:', error);
        this.currentAttempts++;
  
        if (this.currentAttempts >= this.maxAttempts) {
          // Blocage après 3 tentatives
          this.isBlocked = true;
          const blockEndTime = new Date().getTime() + (this.blockDuration * 1000);
          localStorage.setItem('loginBlockedUntil', blockEndTime.toString());
          
          this.remainingBlockTime = this.blockDuration;
          this.startBlockTimer();
          
         // this.errorMessage = `Trop de tentatives. Compte bloqué pendant ${this.blockDuration} secondes.`;
        } else {
          // Affichage du nombre de tentatives restantes
          this.errorMessage = `Code incorrect. Tentatives restantes : ${this.maxAttempts - this.currentAttempts}`;
          this.shakeInputs = true;
          this.inputError = true;
        }
  
        // Réinitialisation des inputs après une tentative
        setTimeout(() => {
          this.resetInputs();
          this.shakeInputs = false;
          this.inputError = false;
        }, 1000);
      }
    );
  }



  onCodeInput(event: Event, index: number) {
    // Conversion de l'événement en élément input HTML
    const input = event.target as HTMLInputElement;
    let value = input.value;
  
    // Limite à un seul caractère
    if (value.length > 1) {
      value = value.slice(-1);
    }
  
    // Stockage du digit réel
    this.codeDigits[index] = value;
  
    if (value) {
      // Affichage temporaire du chiffre
      this.maskedDigits[index] = value;
      input.value = value;
  
      setTimeout(() => {
        // Masquage du chiffre après 500ms
        this.maskedDigits[index] = '•';
        input.value = '•';
      }, 500);
  
      // Déplacement automatique vers l'input suivant
      if (index < 3) {
        const nextInput = this.codeInputs.toArray()[index + 1];
        nextInput?.nativeElement.focus();
      }
    } else {
      // Réinitialisation si aucun digit
      this.maskedDigits[index] = '';
    }
  
    // Vérification du code si tous les digits sont saisis
    if (this.codeDigits.every(digit => digit !== '')) {
      this.verifyCode();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace') {
      // Si l'input courant est vide
      if (!this.codeDigits[index]) {
        // Retour à l'input précédent
        if (index > 0) {
          const prevInput = this.codeInputs.toArray()[index - 1];
          prevInput?.nativeElement.focus();
          this.codeDigits[index - 1] = '';
          this.maskedDigits[index - 1] = '';
        }
      } else {
        // Effacement de l'input courant
        this.codeDigits[index] = '';
        this.maskedDigits[index] = '';
      }
    }
  }

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


  //connexion par carte rfid
  onRFIDScan(uid: string) {
    // Appel du service d'authentification par RFID
    this.utilisateurService.loginByRFID(uid).subscribe(
      response => {
        console.log('Connexion réussie:', response);
  
        // Vérifier le rôle et rediriger
        if (response.user.role === 'super_admin' || response.user.role === 'admin_simple') {
          this.router.navigate(['/dashbord']);
        }
        
        this.isLoggedIn = true;
      },
      error => {
        console.error('Erreur de connexion:', error);
        this.errorMessage = "Carte RFID invalide ou non enregistrée.";
      }
    );
  }
  
  
} 