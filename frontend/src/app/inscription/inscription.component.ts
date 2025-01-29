import { Component } from '@angular/core';
import { SidebarComponent
 } from '../sidebar/sidebar.component';
 import { NavbarComponent } from '../navbar/navbar.component';
 import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css'],
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, FormsModule],
})

export class InscriptionComponent {
  prenom: string = '';
  nom: string = '';
  email: string = '';
  telephone: string = '';
  adresse: string = '';
  role: string = 'Utilisateur';
  carte: string = 'Carte assignée automatiquement'; // Champ non saisissable

  onSubmit() {
    // Logique pour soumettre le formulaire
    console.log('Formulaire soumis:', {
      prenom: this.prenom,
      nom: this.nom,
      email: this.email,
      telephone: this.telephone,
      adresse: this.adresse,
      role: this.role,
      carte: this.carte
    });
  }
}
