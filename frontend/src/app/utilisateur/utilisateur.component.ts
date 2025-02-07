import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { Router } from '@angular/router';
import { UtilisateurService } from '../utilisateur.service';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

declare var $: any;

interface User {
status: any;
  _id: string;
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
  selectedUsers: User[] = [];
  csvFile: File | null = null;
  newRole: string = '';

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
      this.utilisateurService.deleteUtilisateur(this.userToDelete._id).subscribe(
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

  assignCard() {
    if (this.selectedUser && this.carte_rfid_modal) {
      this.utilisateurService.assignCard(this.selectedUser._id, this.carte_rfid_modal).subscribe(
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
                this.utilisateurService.deleteMultipleUtilisateurs(this.selectedUsers.map(user => user._id)).subscribe(
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
              this.utilisateurService.blockMultipleUtilisateurs(this.selectedUsers.map(user => user._id)).subscribe(
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

selectAll(): void {
  if (this.selectedUsers.length === this.paginatedUsers.length) {
      // Si tous les utilisateurs sont déjà sélectionnés, désélectionnez-les
      this.selectedUsers = [];
  } else {
      // Sinon, sélectionnez tous les utilisateurs
      this.selectedUsers = [...this.paginatedUsers];
  }
}


  openSwitchRoleModal(): void {
    if (this.selectedUsers.length === 1) {
      $('#switchRoleModal').modal('show');
    } else {
      alert('Veuillez sélectionner un seul utilisateur pour changer de rôle.');
    }
  }


  switchRole(): void {
    if (this.selectedUsers.length === 1) {
        this.utilisateurService.switchRole(this.selectedUsers[0]._id).subscribe(
            (response) => {
                Swal.fire({
                    icon: 'success',
                    title: 'Rôle mis à jour avec succès',
                    showConfirmButton: false,
                    timer: 1500
                });
                this.loadUsers(); // Rechargez les utilisateurs pour refléter le changement
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

  importCsv(): void {
    if (this.csvFile) {
      const formData = new FormData();
      formData.append('csv_file', this.csvFile);
      this.utilisateurService.importCsv(formData).subscribe(
        (response) => {
          console.log('Utilisateurs importés avec succès', response);
          this.loadUsers();
          $('#csvImportModal').modal('hide');
        },
        (error) => {
          console.error('Erreur lors de l\'importation des utilisateurs', error);
        }
      );
    }
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

 
  
}
