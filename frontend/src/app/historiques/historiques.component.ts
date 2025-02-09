import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "../navbar/navbar.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { UtilisateurService } from '../utilisateur.service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-historiques',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent, FormsModule, HttpClientModule],
  templateUrl: './historiques.component.html',
  styleUrls: ['./historiques.component.css'],
  providers: [UtilisateurService],
})
export class HistoriquesComponent implements OnInit {
  historiques: any[] = [];  // Assurer que c'est bien un tableau vide au départ
  page: number = 1;
  itemsPerPage: number = 5;
  selectedDate: string = ''; // Pour filtrer par date

  constructor(private utilisateurService: UtilisateurService) {}

  ngOnInit(): void {
    this.loadHistoriques();
  }

  loadHistoriques(): void {
    this.utilisateurService.getHistoriques().subscribe({
      next: (data) => {
        if (data && Array.isArray(data.historiques)) {
          this.historiques = data.historiques;  // Accéder à la clé `historiques`
        } else {
          console.error("Les données reçues ne sont pas un tableau :", data);
          this.historiques = [];
        }
      },
      error: (error) => {
        console.error("Erreur lors du chargement des historiques :", error);
      }
    });
  }

  // Charger les historiques filtrés par date
  filterHistoriquesByDate(): void {
    if (this.selectedDate) {
      this.utilisateurService.filterHistoriquesByDate(this.selectedDate).subscribe({
        next: (data) => {
          this.historiques = Array.isArray(data) ? data : [];
          if (this.historiques.length === 0) {
            console.log("Aucune information à ce jour.");
          }
        },
        error: (error) => {
          console.error("Erreur lors du filtrage des historiques par date :", error);
        }
      });
    }
  }

  // Gérer l'input de la date
  onDateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value === '') {
      this.resetFilters();
    }
  }

  // Réinitialiser les filtres
  resetFilters(): void {
    this.selectedDate = '';
    this.loadHistoriques();
  }

  get paginatedHistorique() {
    if (!Array.isArray(this.historiques)) {
      console.error("Erreur : historiques n'est pas un tableau", this.historiques);
      return [];
    }
    const start = (this.page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.historiques.slice(start, end);
  }

  totalPages(): number {
    return this.historiques.length > 0 ? Math.ceil(this.historiques.length / this.itemsPerPage) : 1;
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.page = newPage;
    }
  }
}
