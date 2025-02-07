import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "../navbar/navbar.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { UtilisateurService } from '../utilisateur.service';

@Component({
  selector: 'app-historiques',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent],
  templateUrl: './historiques.component.html',
  styleUrls: ['./historiques.component.css']
})
export class HistoriquesComponent implements OnInit {
  historiques: any[] = [];
  page: number = 1;
  itemsPerPage: number = 5;

  constructor(private utilisateurService: UtilisateurService) { }

  ngOnInit(): void {
    this.loadHistorique();
  }

  loadHistorique(): void {
    this.utilisateurService.getHistorique().subscribe(
      data => {
        this.historiques = data.historiques;
      },
      error => {
        console.error('Erreur lors de la récupération de l\'historique', error);
      }
    );
  }

  get paginatedHistorique() {
    const start = (this.page - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.historiques.slice(start, end);
  }

  totalPages(): number {
    return Math.ceil(this.historiques.length / this.itemsPerPage);
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.page = newPage;
    }
  }
}
