import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SidebarComponent implements OnInit {
  role: string = ''; // Déclare une variable pour le rôle

  // Cette fonction est exécutée au chargement du composant
  ngOnInit(): void {
    // Récupérer le rôle depuis le localStorage
    this.role = localStorage.getItem('role') || '';
  }

  // Fonction pour vérifier si l'utilisateur est un super_admin
  isSuperAdmin(): boolean {
    return this.role === 'super_admin';
  }

  // Fonction pour vérifier si l'utilisateur est un admin simple
  isAdminSimple(): boolean {
    return this.role === 'admin_simple';
  }
}
