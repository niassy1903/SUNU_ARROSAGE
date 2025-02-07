import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlaningService {

  private apiUrl = 'http://localhost:5000/api/schedule'; // URL de votre backend

  constructor(private http: HttpClient) {}

  // Ajouter un horaire
  addSchedule(startTime: string, endTime: string): Observable<any> {
    return this.http.post(this.apiUrl, { startTime, endTime });
  }

  // Récupérer tous les horaires
  getSchedules(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Supprimer un horaire
  deleteSchedule(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
