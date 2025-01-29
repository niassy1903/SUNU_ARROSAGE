import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "../navbar/navbar.component";
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-historiques',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent],
  templateUrl: './historiques.component.html',
  styleUrl: './historiques.component.css'
})
export class HistoriquesComponent {
  historiques = [
    { photo: 'null', prenom: 'Mark', nom: 'Otto', actions: 'crud' , date: '2021-09-01 12:00:00',heure: '12:00:00'},
    { photo: 'null', prenom: 'Jacob', nom: 'Thornton', actions: 'arrosage automatique' , date: '2021-09-01 12:00:00',heure: '12:00:00'},
    { photo: 'null', prenom: 'Larry', nom: 'the Bird', actions: 'crud', date: '2021-09-01 12:00:00',heure: '12:00:00' },
    { photo: 'null', prenom: 'Mark', nom: 'Otto', actions: 'crud', date: '2021-09-01 12:00:00',heure: '12:00:00' },
    { photo: 'null', prenom: 'Jacob', nom: 'Thornton', actions: 'arrosage automatique' , date: '2021-09-01 12:00:00',heure: '12:00:00'},
    { photo: 'null', prenom: 'Larry', nom: 'the Bird', actions: 'crud', date: '2021-09-01 12:00:00',heure: '12:00:00' },
    { photo: 'null', prenom: 'Mark', nom: 'Otto', actions: 'crud', date: '2021-09-01 12:00:00',heure: '12:00:00' },
    { photo: 'null', prenom: 'Jacob', nom: 'Thornton', actions: 'arrosage automatique', date: '2021-09-01 12:00:00',heure: '12:00:00' },
    { photo: 'null', prenom: 'Larry', nom: 'the Bird', actions: 'crud', date: '2021-09-01 12:00:00',heure: '12:00:00' },
    { photo: 'null', prenom: 'Mark', nom: 'Otto', actions: 'crud', date: '2021-09-01 12:00:00',heure: '12:00:00' },
    { photo: 'null', prenom: 'Jacob', nom: 'Thornton', actions: 'arrosage automatique' , date: '2021-09-01 12:00:00',heure: '12:00:00'},
    { photo: 'null', prenom: 'Larry', nom: 'the Bird', actions: 'crud' , date: '2021-09-01 12:00:00',heure: '12:00:00'},
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