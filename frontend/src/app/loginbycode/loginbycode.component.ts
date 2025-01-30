import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-loginbycode',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loginbycode.component.html',
  styleUrl: './loginbycode.component.css'
})
export class LoginbycodeComponent {
  codeDigits: string[] = ['', '', '', '']; // Stockage des chiffres
  maskedDigits: string[] = ['', '', '', '']; // Pour l'affichage masqué

  onCodeInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Assure qu'un seul caractère est entré
    if (value.length > 1) {
      value = value.slice(-1);
    }

    // Stocke la vraie valeur
    this.codeDigits[index] = value;

    // Masque la valeur après un court délai
    if (value) {
      // Affiche brièvement le chiffre
      this.maskedDigits[index] = value;
      input.value = value;

      setTimeout(() => {
        // Remplace par un point après 500ms
        this.maskedDigits[index] = '•';
        input.value = '•';
      }, 500);

      // Déplace le focus vers le prochain input
      if (index < 3) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    } else {
      // Si la valeur est vide, efface aussi le masque
      this.maskedDigits[index] = '';
    }

    // Vérifie si le code est complet
    if (this.codeDigits.every(digit => digit !== '')) {
      this.verifyCode();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    // Gestion de la touche backspace
    if (event.key === 'Backspace') {
      if (!this.codeDigits[index]) {
        // Si le champ actuel est vide, retourne au précédent
        if (index > 0) {
          const prevInput = document.getElementById(`code-${index - 1}`);
          prevInput?.focus();
          // Efface la valeur du champ précédent
          this.codeDigits[index - 1] = '';
          this.maskedDigits[index - 1] = '';
        }
      } else {
        // Efface la valeur du champ actuel
        this.codeDigits[index] = '';
        this.maskedDigits[index] = '';
      }
    }
  }

  verifyCode() {
    const code = this.codeDigits.join('');
    console.log('Code à vérifier:', code);
    // Ajoutez ici la logique de vérification du code
  }
}