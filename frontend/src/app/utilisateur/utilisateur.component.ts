import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { Router } from '@angular/router';
import { UtilisateurService } from '../utilisateur.service';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { io, Socket } from 'socket.io-client';

declare var $: any;

interface User {
  status: string;
  id: string;
  nom: string;
  prenom: string;
  role: string;
  telephone: string;
  adresse: string;
  carte_rfid: string;
  matricule: string;
  code_secret: string;
  email: string;
}

@Component({
  selector: 'app-utilisateur',
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, NavbarComponent, HttpClientModule],
  providers: [UtilisateurService],
})
export class UtilisateurComponent implements OnInit, OnDestroy {
  users: User[] = [];
  paginatedUsers: User[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 0;
  userToDelete: User | null = null;
  selectedUser: User | null = null;
  carte_rfid_modal: string = '';
  carteRfidModalError: string = '';
  selectedUsers: User[] = [];
  csvFile: File | null = null;
  newRole: string = '';
  private socket: Socket;

  constructor(private router: Router, private utilisateurService: UtilisateurService) {
    this.socket = io('http://localhost:5000'); // Assurez-vous que l'URL correspond à votre serveur
  }

  ngOnInit(): void {
    this.loadUsers();
    this.listenForCardUID();
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }

  listenForCardUID(): void {
    this.socket.on('card_uid', (uid: string) => {
      this.carte_rfid_modal = uid;
      console.log('UID reçu:', uid); // Vérifiez si cela s'affiche
    });
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
      user.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.matricule.toLowerCase().includes(this.searchTerm.toLowerCase())
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
      this.utilisateurService.deleteUtilisateur(this.userToDelete.id).subscribe(
        (response) => {
          console.log('Utilisateur supprimé avec succès', response);
          $('#deleteConfirmationModal').modal('hide');
          this.loadUsers();
        },
        (error) => {
          console.error('Erreur lors de la suppression de l\'utilisateur', error);
        }
      );
    }
  }

  editUser(user: User): void {
    if (user.status === 'inactif') {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible d\'éditer un utilisateur bloqué.',
      });
      return;
    }
    if (user && user.id) {
      this.router.navigate(['/edit', user.id]);
    } else {
      console.error("L'utilisateur sélectionné n'a pas d'ID valide", user);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Impossible d'éditer cet utilisateur, ID manquant.",
      });
    }
  }

  openProfileModal(user: User): void {
    this.selectedUser = user;
    $('#profileModal').modal('show');
  }

  openAssignCardModal(user: User): void {
    this.selectedUser = user;
    $('#assignCardModal').modal('show');
  }

  assignCard() {
    if (this.selectedUser && this.carte_rfid_modal) {
      this.utilisateurService.assignCard(this.selectedUser.id, this.carte_rfid_modal).subscribe(
        response => {
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: response.message,
          });
          if (this.selectedUser) {
            this.selectedUser.carte_rfid = this.carte_rfid_modal;
          }
          this.carte_rfid_modal = ''; // Réinitialiser le champ d'entrée
          $('#assignCardModal').modal('hide');
        },
        error => {
          if (error.error && error.error.error) {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: error.error.error,
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Une erreur inattendue s\'est produite.',
            });
          }
          this.carteRfidModalError = error.error.error;
        }
      );
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Aucun utilisateur sélectionné ou numéro de carte RFID non fourni.',
      });
    }
  }

  confirmDeleteMultiple(): void {
    if (this.selectedUsers.length > 0) {
      Swal.fire({
        title: 'Êtes-vous sûr?',
        text: "Vous ne pourrez pas revenir en arrière!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, supprimer!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.utilisateurService.deleteMultipleUtilisateurs(this.selectedUsers.map(user => user.id)).subscribe(
            (response) => {
              Swal.fire(
                'Supprimé!',
                'Utilisateurs supprimés avec succès.',
                'success'
              );
              this.loadUsers();
            },
            (error) => {
              console.error('Erreur lors de la suppression des utilisateurs', error);
            }
          );
        }
      });
    }
  }

  blockMultiple(): void {
    if (this.selectedUsers.length > 0) {
      const allUsersActive = this.selectedUsers.every(user => user.status === 'actif');
      if (!allUsersActive) {
        Swal.fire({
          icon: 'warning',
          title: 'Attention',
          text: 'Certains utilisateurs sélectionnés sont déjà bloqués.',
        });
        return;
      }

      Swal.fire({
        title: 'Êtes-vous sûr?',
        text: "Vous êtes sur le point de bloquer ces utilisateurs!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, bloquer!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.utilisateurService.blockMultipleUtilisateurs(this.selectedUsers.map(user => user.id)).subscribe(
            (response) => {
              Swal.fire(
                'Bloqué!',
                'Utilisateurs bloqués avec succès.',
                'success'
              );
              this.loadUsers();
            },
            (error) => {
              console.error('Erreur lors du blocage des utilisateurs', error);
            }
          );
        }
      });
    }
  }

  unblockMultiple(): void {
    if (this.selectedUsers.length > 0) {
      const allUsersInactive = this.selectedUsers.every(user => user.status === 'inactif');
      if (!allUsersInactive) {
        Swal.fire({
          icon: 'warning',
          title: 'Attention',
          text: 'Certains utilisateurs sélectionnés sont déjà actifs.',
        });
        return;
      }

      Swal.fire({
        title: 'Êtes-vous sûr?',
        text: "Vous êtes sur le point de débloquer ces utilisateurs!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, débloquer!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.utilisateurService.unblockMultipleUtilisateurs(this.selectedUsers.map(user => user.id)).subscribe(
            (response) => {
              Swal.fire(
                'Débloqué!',
                'Utilisateurs débloqués avec succès.',
                'success'
              );
              this.loadUsers();
            },
            (error) => {
              console.error('Erreur lors du déblocage des utilisateurs', error);
            }
          );
        }
      });
    }
  }

  selectAll(): void {
    if (this.selectedUsers.length === this.paginatedUsers.length) {
      this.selectedUsers = [];
    } else {
      this.selectedUsers = [...this.paginatedUsers];
    }
  }

  openSwitchRoleModal(): void {
    if (this.selectedUsers.length === 1 && this.selectedUsers[0].status === 'actif') {
      $('#switchRoleModal').modal('show');
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Veuillez sélectionner un seul utilisateur actif pour changer de rôle.',
      });
    }
  }

  switchRole(): void {
    if (this.selectedUsers.length === 1) {
      this.utilisateurService.switchRole(this.selectedUsers[0].id).subscribe(
        (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Rôle mis à jour avec succès',
            showConfirmButton: false,
            timer: 1500
          });
          this.loadUsers();
        },
        (error) => {
          console.error('Erreur lors de la mise à jour du rôle', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur est survenue lors de la mise à jour du rôle.',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Sélection requise',
        text: 'Veuillez sélectionner un seul utilisateur pour changer de rôle.',
      });
    }
  }

  openCsvImportModal(): void {
    $('#csvImportModal').modal('show');
  }

  onFileSelected(event: any): void {
    this.csvFile = event.target.files[0];
  }

  toggleSelection(user: User): void {
    const index = this.selectedUsers.indexOf(user);
    if (index === -1) {
      this.selectedUsers.push(user);
    } else {
      this.selectedUsers.splice(index, 1);
    }
  }

  isSelected(user: User): boolean {
    return this.selectedUsers.includes(user);
  }

  importCsv() {
    if (this.csvFile) {
      const formData = new FormData();
      formData.append('csv_file', this.csvFile);
      this.utilisateurService.importCsv(formData).subscribe(
        response => {
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: response.message,
          });
          $('#csvImportModal').modal('hide');
        },
        error => {
          if (error.error && error.error.error) {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: error.error.error,
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Une erreur inattendue s\'est produite.',
            });
          }
        }
      );
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Aucun fichier CSV sélectionné.',
      });
    }
  }
}
