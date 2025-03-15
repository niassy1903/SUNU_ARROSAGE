import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { UtilisateurService } from '../utilisateur.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

declare var $: any;

interface User {
  nom: string;
  prenom: string;
  email: string;
  role: string;
  telephone: string;
  adresse: string;
}

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css'],
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, FormsModule, CommonModule, HttpClientModule],
  providers: [UtilisateurService],
})
export class InscriptionComponent {
  nom: string = '';
  prenom: string = '';
  email: string = '';
  role: string = 'admin_simple';
  telephone: string = '';
  adresse: string = '';
  telephoneError: string = '';
  emailError: string = '';
  carteRfidError: string = '';
  nomError: string = '';
  prenomError: string = '';
  adresseError: string = '';



  constructor(private utilisateurService: UtilisateurService, private router: Router) {}

  validateTelephone() {
    const telephonePattern = /^(70|77|76|75|78)\d{7}$/;
    if (!telephonePattern.test(this.telephone)) {
      this.telephoneError = 'Le numéro de téléphone doit commencer par 70, 77, 76, 75 ou 78 suivi de 6 chiffres.';
    } else {
      this.telephoneError = '';
    }
  }

  validateNom() {
    if (!this.nom) {
      this.nomError = 'Le nom est requis.';
    } else {
      this.nomError = '';
    }
  }
  
  validatePrenom() {
    if (!this.prenom) {
      this.prenomError = 'Le prénom est requis.';
    } else {
      this.prenomError = '';
    }
  }
  
  validateEmail() {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.email)) {
      this.emailError = 'L\'email n\'est pas valide.';
    } else {
      this.emailError = '';
    }
  }
  
  validateAdresse() {
    if (!this.adresse) {
      this.adresseError = 'L\'adresse est requise.';
    } else {
      this.adresseError = '';
    }
  }

  
  onSubmit() {
    const utilisateur: User = {
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      role: this.role,
      telephone: this.telephone,
      adresse: this.adresse,
    };
  
    this.utilisateurService.createUtilisateur(utilisateur).subscribe(
      (response) => {
        console.log('Utilisateur créé avec succès', response);
        $('#successModal').modal('show');
        setTimeout(() => {
          $('#successModal').modal('hide');
          this.router.navigate(['/utilisateur']);
        }, 2000);
      },
      (error) => {
        console.error('Erreur lors de la création de l\'utilisateur', error);
        if (error.error && error.error.errors) {
          const errors = error.error.errors;
          if (errors.telephone) {
            this.telephoneError = errors.telephone[0];
          }
          if (errors.email) {
            this.emailError = errors.email[0];
          }
          if (errors.carte_rfid) {
            this.carteRfidError = errors.carte_rfid[0];
          }
        }
      }
    );
  
  

    this.utilisateurService.createUtilisateur(utilisateur).subscribe(
      (response) => {
        console.log('Utilisateur créé avec succès', response);
        // Afficher le modal de succès
        $('#successModal').modal('show');
        // Rediriger vers la liste des utilisateurs après un délai
        setTimeout(() => {
          $('#successModal').modal('hide');
          this.router.navigate(['/utilisateur']);
        }, 2000); // Délai de 2 secondes
      },
      (error) => {
        console.error('Erreur lors de la création de l\'utilisateur', error);
      }
    );
  }

  onRetour() {
    this.router.navigate(['/utilisateur']); // Replace '/previous-page' with the actual route you want to navigate to
  }
  
}