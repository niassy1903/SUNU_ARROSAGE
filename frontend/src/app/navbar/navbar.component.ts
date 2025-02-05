import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UtilisateurService } from '../utilisateur.service'; // Import du service
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [UtilisateurService],
})
export class NavbarComponent implements OnInit {
  @Input() searchTerm: string = '';
  nom: string = '';
  prenom: string = '';
  role: string = '';

  constructor(
    private router: Router,
    public utilisateurService: UtilisateurService // Injection du service
  ) {}

  ngOnInit(): void {
    // Récupérer les informations du localStorage
    this.nom = localStorage.getItem('nom') || '';
    this.prenom = localStorage.getItem('prenom') || '';
    this.role = localStorage.getItem('role') || '';
  }

  // Fonction de déconnexion
  logout(): void {
    this.utilisateurService.logout().subscribe(
      () => {
        console.log('Déconnexion réussie, redirection vers /loginbycode');
        this.router.navigate(['/loginbycode']);
      },
      error => {
        console.error('Erreur de déconnexion:', error);
        // Gérer l'erreur si nécessaire
      }
    );
  }
  
}
