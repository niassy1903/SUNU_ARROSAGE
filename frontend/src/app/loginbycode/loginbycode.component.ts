import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilisateurService } from '../utilisateur.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-loginbycode',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './loginbycode.component.html',
  styleUrls: ['./loginbycode.component.css'],
  providers: [UtilisateurService],
})
export class LoginbycodeComponent {
  codeDigits: string[] = ['', '', '', '']; // Stocke les chiffres réels
  maskedDigits: string[] = ['', '', '', '']; // Gère l'affichage masqué
  errorMessage: string = ''; // Message d'erreur

  constructor(
    private utilisateurService: UtilisateurService, 
    private router: Router,
    private ngZone: NgZone  // 🔥 Ajout de NgZone pour forcer la mise à jour Angular
  ) {}

  onCodeInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Assure qu'un seul caractère est entré
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

      // 🔥 Passe au champ suivant si ce n'est pas le dernier
      if (index < 3) {
        const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
        nextInput?.focus();
      }
    } else {
      this.maskedDigits[index] = '';
    }

    // Vérifie si tous les chiffres sont remplis
    if (this.codeDigits.every(digit => digit !== '')) {
      this.verifyCode();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace') {
      if (!this.codeDigits[index]) {
        // 🔥 Si le champ est vide, revient au précédent
        if (index > 0) {
          const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
          prevInput?.focus();
          this.codeDigits[index - 1] = '';
          this.maskedDigits[index - 1] = '';
        }
      } else {
        // 🔥 Sinon, efface le champ actuel
        this.codeDigits[index] = '';
        this.maskedDigits[index] = '';
      }
    }
  }

  verifyCode() {
    const code = this.codeDigits.join('');
    this.utilisateurService.login(code).subscribe(
      (response) => {
        if (response.token) {
          localStorage.setItem('token', response.token);

          if (response.redirect === 'dashbord') {
            this.router.navigate(['/dashbord']);
          } else if (response.redirect === 'dashboard_simple') {
            this.router.navigate(['/dashboard_simple']);
          } else {
            this.router.navigate(['/loginbycode']);
          }

          this.resetCodeInputs();
          this.errorMessage = '';
        } else {
          this.errorMessage = 'Code secret invalide';
          this.resetCodeInputs();
        }
      },
      (error) => {
        this.errorMessage = 'Erreur de connexion';
        this.resetCodeInputs();
      }
    );
  }

  resetCodeInputs() {
    this.ngZone.run(() => {
      this.codeDigits = ['', '', '', ''];
      this.maskedDigits = ['', '', '', ''];

      setTimeout(() => {
        for (let i = 0; i < 4; i++) {
          const input = document.getElementById(`code-${i}`) as HTMLInputElement;
          if (input) {
            input.value = ''; // 🔥 Vide complètement les champs
          }
        }

        // 🔥 Force une mise à jour d'Angular
        this.maskedDigits = ['', '', '', ''];
        this.codeDigits = ['', '', '', ''];

        // 🔥 Focus sur le premier champ
        const firstInput = document.getElementById('code-0') as HTMLInputElement;
        firstInput?.focus();
      }, 10); // Petit délai pour éviter le lag
    });
  }
}
