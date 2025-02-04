import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JwtService } from '../jwt.service';
import { UtilisateurService } from '../utilisateur.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [JwtService, UtilisateurService],
})
export class NavbarComponent implements OnInit {
  searchTerm: string = '';
  userName: string = '';
  userPrenom: string = ''; // Ajouté pour le prénom
  userRole: string = '';

  constructor(private jwtService: JwtService, private utilisateurService: UtilisateurService, private router: Router) {}
  
  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = this.jwtService.decodeToken(token);
      if (decodedToken) {
        this.userRole = decodedToken.role;
      }
    }
    
    // Récupérer prénom et nom depuis le localStorage
    this.userPrenom = localStorage.getItem('prenom') || '';
    this.userName = localStorage.getItem('nom') || '';
  }
  

  logout(): void {
    this.utilisateurService.logout().subscribe(
      (response) => {
        console.log('Déconnexion réussie', response);
        // Supprimer le token du localStorage
        localStorage.removeItem('token');
        // Rediriger vers la page de connexion
        this.router.navigate(['/loginbycode']);
      },
      (error) => {
        console.error('Erreur lors de la déconnexion', error);
      }
    );
  }
}
