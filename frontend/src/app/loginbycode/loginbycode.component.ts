import { Component, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { UtilisateurService } from '../utilisateur.service';
  import { Router } from '@angular/router';
  import { HttpClientModule } from '@angular/common/http';
  import { io, Socket } from 'socket.io-client';
  
  @Component({
    selector: 'app-loginbycode',
    standalone: true,
    imports: [CommonModule, FormsModule, HttpClientModule],
    templateUrl: './loginbycode.component.html',
    styleUrls: ['./loginbycode.component.css'],
    providers: [UtilisateurService],
  })
  export class LoginbycodeComponent implements AfterViewInit {
    @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef>;
  
    codeDigits: string[] = ['', '', '', ''];
    maskedDigits: string[] = ['', '', '', ''];
   
    additionalErrors: string[] = []; // Tableau pour stocker les erreurs supplémentaires
  
    errorMessage: string = '';
    shakeInputs: boolean = false;
    inputError: boolean = false;
    isLoggedIn: boolean = false;
  
    maxAttempts: number = 3;
    currentAttempts: number = 0;
    isBlocked: boolean = false;
    blockDuration: number = 5;
    remainingBlockTime: number = 0;
    blockTimer: any;
    countdownProgress: number = 0;
  
    socket: Socket;
  
    constructor(public utilisateurService: UtilisateurService, private router: Router) {
      this.isLoggedIn = !!localStorage.getItem('token');
      this.checkPreviousBlock();
  
      // Connexion WebSocket pour recevoir le Keypad en temps réel
      this.socket = io('http://localhost:5000');
  
      // Écoute des événements du serveur
      this.socket.on('login_success', (data) => this.handleLoginSuccess(data));
      this.socket.on('login_failed', () => this.handleLoginFailure());
      this.socket.on('login_blocked', (data) => this.handleLoginBlocked(data));
      this.socket.on('login_unblocked', () => this.handleLoginUnblocked());
      this.socket.on('code_secret', (code: string) => this.handleKeypadInput(code));
    }
  
      // Dans loginbycode.component.ts
    ngAfterViewInit() {
      this.focusFirstInput();
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

    onCodeInput(event: Event, index: number) {
      const input = event.target as HTMLInputElement;
      let value = input.value;
      if (value.length > 1) {
        value = value.slice(-1);
      }
      this.codeDigits[index] = value;
      if (value) {
        this.maskedDigits[index] = value;
        input.value = value;
        setTimeout(() => {
          this.maskedDigits[index] = '•';
          input.value = '•';
        }, 500);
        if (index < 3) {
          const nextInput = this.codeInputs.toArray()[index + 1];
          nextInput?.nativeElement.focus();
        }
      } else {
        this.maskedDigits[index] = '';
      }
      if (this.codeDigits.every(digit => digit !== '')) {
        this.verifyCode();
      }
    }
  
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

   // Dans loginbycode.component.ts
handleKeypadInput(key: string) {
  if (this.isBlocked) return;

  const currentIndex = this.codeDigits.findIndex(digit => digit === '');

  if (currentIndex !== -1 && currentIndex < 4) {
    // Mise à jour des états
    this.codeDigits[currentIndex] = key;
    this.maskedDigits[currentIndex] = key;

    const currentInput = this.codeInputs.toArray()[currentIndex];
    if (currentInput) {
      // Afficher la valeur puis la masquer
      currentInput.nativeElement.value = key;

      setTimeout(() => {
        currentInput.nativeElement.value = '•';

        // Passer à l'input suivant si ce n'est pas le dernier
        if (currentIndex < 3) {
          const nextInput = this.codeInputs.toArray()[currentIndex + 1];
          if (nextInput) {
            nextInput.nativeElement.focus();
          }
        } else {
          // Si c'est le dernier chiffre, vérifier le code
          this.verifyCode();
        }
      }, 500);
    }
  }
}


updateInputFocus(index: number) {
  // Move focus to the next input field if not the last one
  if (index < 3) {
    const nextInput = this.codeInputs.toArray()[index + 1];
    nextInput?.nativeElement.focus();
  }
}
  
  
  
verifyCode() {
  if (this.isBlocked) return;

  const code = this.codeDigits.join('');
  if (code.length < 4) return;

  this.utilisateurService.loginByCode(code).subscribe(
    (response) => this.handleLoginSuccess(response),
    () => this.handleLoginFailure()
  );
}

  
handleLoginSuccess(response: any) {
  console.log('✅ Connexion réussie:', response);
  if (response.user && response.user.id) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('prenom', response.user.prenom);
    localStorage.setItem('nom', response.user.nom);
    localStorage.setItem('role', response.user.role);
    localStorage.setItem('userId', response.user.id); // Stocker l'ID de l'utilisateur
    console.log('ID de l\'utilisateur stocké:', response.user.id);
  } else {
    console.error('ID de l\'utilisateur manquant dans la réponse:', response);
  }

  if (response.user.role === 'super_admin' || response.user.role === 'admin_simple') {
    this.router.navigate(['/dashbord']);
  }
}
    
  
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
  

   // Exemple de gestion des erreurs
  handleLoginFailure() {
    this.currentAttempts++;
    this.errorMessage = `Code incorrect. Tentatives restantes : ${this.maxAttempts - this.currentAttempts}`;
    this.shakeInputs = true;
    this.inputError = true;

    // Ajouter des erreurs supplémentaires
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
        this.additionalErrors = []; // Réinitialiser les erreurs supplémentaires
      }, 1500);
    }
  }

    blockUser() {
      this.isBlocked = true;
      const blockEndTime = new Date().getTime() + this.blockDuration * 1000;
      localStorage.setItem('loginBlockedUntil', blockEndTime.toString());
      this.remainingBlockTime = this.blockDuration;
      this.startBlockTimer();
    }
  
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
  
    handleLoginUnblocked() {
      this.isBlocked = false;
      this.remainingBlockTime = 0;
      this.currentAttempts = 0;
      this.errorMessage = '';
      localStorage.removeItem('loginBlockedUntil');
      this.resetInputs();
    }
  
    focusFirstInput() {
      setTimeout(() => {
        const firstInput = this.codeInputs.first;
        if (firstInput && !this.isBlocked) {
          firstInput.nativeElement.focus();
        }
      }, 0);
    }
  
   // Réinitialiser les erreurs supplémentaires
  resetInputs() {
    this.codeDigits = ['', '', '', ''];
    this.maskedDigits = ['', '', '', ''];
    this.focusFirstInput();
    this.inputError = false;
    this.additionalErrors = [];
  }
  
    resetAttempts() {
      this.currentAttempts = 0;
      this.isBlocked = false;
      this.remainingBlockTime = 0;
      this.errorMessage = '';
      localStorage.removeItem('loginBlockedUntil');
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
  }