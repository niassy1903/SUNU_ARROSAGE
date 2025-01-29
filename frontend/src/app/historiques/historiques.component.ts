import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historiques',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historiques.component.html',
  styleUrl: './historiques.component.css'
})
export class HistoriquesComponent {
  historiques = [
    { photo: 'null', prenom: 'Mark', nom: 'Otto', actions: 'crud' },
    { photo: 'null', prenom: 'Jacob', nom: 'Thornton', actions: 'arrosage automatique' },
    { photo: 'null', prenom: 'Larry', nom: 'the Bird', actions: 'crud' },
    { photo: 'null', prenom: 'Mark', nom: 'Otto', actions: 'crud' },
    { photo: 'null', prenom: 'Jacob', nom: 'Thornton', actions: 'arrosage automatique' },
    { photo: 'null', prenom: 'Larry', nom: 'the Bird', actions: 'crud' },
    { photo: 'null', prenom: 'Mark', nom: 'Otto', actions: 'crud' },
    { photo: 'null', prenom: 'Jacob', nom: 'Thornton', actions: 'arrosage automatique' },
    { photo: 'null', prenom: 'Larry', nom: 'the Bird', actions: 'crud' },
    { photo: 'null', prenom: 'Mark', nom: 'Otto', actions: 'crud' },
    { photo: 'null', prenom: 'Jacob', nom: 'Thornton', actions: 'arrosage automatique' },
    { photo: 'null', prenom: 'Larry', nom: 'the Bird', actions: 'crud' }
  ];

  //-----------------------la pagination avec bootstrap------------------------------
  page: number = 1; // Page actuelle                                                :
  itemsPerPage: number = 5; // Nombre d'éléments par page                           :
                                                                                    
  get paginatedHistorique() {                                                       //
    const start = (this.page - 1) * this.itemsPerPage;                              //
    const end = start + this.itemsPerPage;                                          //
    return this.historiques.slice(start, end);                                      //
  }
                                                                                    //
  totalPages(): number {
    return Math.ceil(this.historiques.length / this.itemsPerPage);     
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.page = newPage;
    }
  }

}
//------------------------------Fin pagination---------------------------------------