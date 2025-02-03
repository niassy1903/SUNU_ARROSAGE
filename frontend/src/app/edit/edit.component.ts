// src/app/edit/edit.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilisateurService } from '../utilisateur.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';

declare var $: any;

interface User {
  _id: string;
  nom: string;
  prenom: string;
  role: string;
  telephone: string;
  adresse: string;
  carte_rfid: string;
  matricule: string;
  code_secret: string;
}

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, SidebarComponent, NavbarComponent],
  providers: [UtilisateurService],
})

export class EditComponent implements OnInit {
  user: User = {
    _id: '',
    nom: '',
    prenom: '',
    role: '',
    telephone: '',
    adresse: '',
    carte_rfid: '',
    matricule: '',
    code_secret: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private utilisateurService: UtilisateurService
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.utilisateurService.getUtilisateur(userId).subscribe(
        (response) => {
          this.user = response.utilisateur;
        },
        (error) => {
          console.error('Erreur lors de la récupération de l\'utilisateur', error);
        }
      );
    }
  }

  confirmUpdate(): void {
    $('#updateConfirmationModal').modal('show');
  }

  updateUser(): void {
    this.utilisateurService.updateUtilisateur(this.user._id, this.user).subscribe(
      (response) => {
        console.log('Utilisateur mis à jour avec succès', response);
        $('#updateConfirmationModal').modal('hide');
        this.router.navigate(['/utilisateur']);
      },
      (error) => {
        console.error('Erreur lors de la mise à jour de l\'utilisateur', error);
      }
    );
  }

  onSubmit(): void {
    this.utilisateurService.updateUtilisateur(this.user._id, this.user).subscribe(
      (response) => {
        console.log('Utilisateur mis à jour avec succès', response);
        this.router.navigate(['/utilisateur']);
      },
      (error) => {
        console.error('Erreur lors de la mise à jour de l\'utilisateur', error);
      }
    );
  }
}
