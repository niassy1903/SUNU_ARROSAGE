import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilisateurService } from '../utilisateur.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [UtilisateurService],
})
export class SidebarComponent implements OnInit {
  role: string | null = null;

  constructor(private utilisateurService: UtilisateurService) {}

  ngOnInit() {
    // Récupérer le rôle depuis le localStorage
    this.role = localStorage.getItem('role'); // Assurez-vous que le rôle est bien stocké après la connexion
  }

  isSuperAdmin(): boolean {
    return this.role === 'super_admin';
  }
}
