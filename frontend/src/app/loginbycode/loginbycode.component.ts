import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { routes } from '../app.routes';


@Component({
  selector: 'app-loginbycode',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loginbycode.component.html',
  styleUrl: './loginbycode.component.css'
})
export class LoginbycodeComponent {
  codeDigits: string[] = ['', '', '', ''];

  onCodeInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Assure qu'un seul caractère est entré
    if (value.length > 1) {
      input.value = value.slice(-1);
    }

    // Déplace le focus vers le prochain input
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    // Vérifie si le code est complet
    if (this.codeDigits.every(digit => digit !== '')) {
      this.verifyCode();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    // Gestion de la touche backspace
    if (event.key === 'Backspace' && index > 0 && !this.codeDigits[index]) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  }

  verifyCode() {
    const code = this.codeDigits.join('');
    console.log('Code à vérifier:', code);
    // Ajoutez ici la logique de vérification du code
  }
}
