import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { Router } from '@angular/router';
import { UtilisateurService } from '../utilisateur.service';
import { HttpClientModule } from '@angular/common/http';
import { JwtService } from '../jwt.service';

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
  selector: 'app-utilisateur',
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, NavbarComponent, HttpClientModule],
  providers: [UtilisateurService, JwtService],
})
export class UtilisateurComponent implements OnInit {
  users: User[] = [];
  paginatedUsers: User[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 13;
  totalPages: number = 0;
  userToDelete: User | null = null;
  selectedUser: User | null = null;
  carte_rfid_modal: string = '';
  carteRfidModalError: string = '';

  constructor(private router: Router, private utilisateurService: UtilisateurService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.utilisateurService.listUtilisateurs().subscribe(
      (response) => {
        this.users = response.utilisateurs;
        this.filterAndPaginateUsers();
      },
      (error) => {
        console.error('Erreur lors de la récupération des utilisateurs', error);
      }
    );
  }

  filterAndPaginateUsers(): void {
    let filteredUsers = this.users.filter(user =>
      user.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.prenom.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.totalPages = Math.ceil(filteredUsers.length / this.itemsPerPage);
    this.paginatedUsers = filteredUsers.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page < 1) {
      page = 1;
    } else if (page > this.totalPages) {
      page = this.totalPages;
    }
    this.currentPage = page;
    this.filterAndPaginateUsers();
  }

  addUser(): void {
    this.router.navigate(['/inscription']);
  }

  confirmDelete(user: User): void {
    this.userToDelete = user;
    $('#deleteConfirmationModal').modal('show');
  }

  deleteUser(): void {
    if (this.userToDelete) {
      this.utilisateurService.deleteUtilisateur(this.userToDelete._id).subscribe(
        (response) => {
          console.log('Utilisateur supprimé avec succès', response);
          $('#deleteConfirmationModal').modal('hide');
          this.loadUsers(); // Rafraîchir la liste des utilisateurs
        },
        (error) => {
          console.error('Erreur lors de la suppression de l\'utilisateur', error);
        }
      );
    }
  }

  editUser(user: User): void {
    this.router.navigate(['/edit', user._id]);
  }

  openProfileModal(user: User): void {
    this.selectedUser = user;
    $('#profileModal').modal('show');
  }

  openAssignCardModal(user: User): void {
    this.selectedUser = user;
    $('#assignCardModal').modal('show');
  }

  assignCard(): void {
    if (!this.carte_rfid_modal) {
      this.carteRfidModalError = 'La carte RFID est requise.';
      return;
    }
    if (this.selectedUser) {
      this.selectedUser.carte_rfid = this.carte_rfid_modal;
      this.utilisateurService.updateUtilisateur(this.selectedUser._id, this.selectedUser).subscribe(
        (response) => {
          console.log('Carte RFID assignée avec succès', response);
          $('#assignCardModal').modal('hide');
          this.loadUsers(); // Rafraîchir la liste des utilisateurs
        },
        (error) => {
          console.error('Erreur lors de l\'assignation de la carte RFID', error);
        }
      );
    }
  }
}
