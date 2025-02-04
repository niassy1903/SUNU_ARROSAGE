import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:8000/api/utilisateurs'; // Remplacez par l'URL de votre API
  private historiqueUrl = 'http://localhost:8000/api/historiques'; // Remplacez par l'URL de votre API

  constructor(private http: HttpClient) { }

  login(codeSecret: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { code_secret: codeSecret }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.utilisateur.role);
          localStorage.setItem('prenom', response.utilisateur.prenom); // Ajout du prénom
          localStorage.setItem('nom', response.utilisateur.nom); // Ajout du nom
        }
      })
    );
  }
  
  
  logout(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` })
    }).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('prenom'); // Suppression du prénom
        localStorage.removeItem('nom'); // Suppression du nom
      })
    );
  }
  

  // Créer un utilisateur
  createUtilisateur(utilisateur: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, utilisateur);
  }

  // Lister tous les utilisateurs
  listUtilisateurs(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.apiUrl}`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    });
  }

  // Récupérer un utilisateur spécifique
  getUtilisateur(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.apiUrl}/${id}`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    });
  }

  // Supprimer un utilisateur
  deleteUtilisateur(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    });
  }

  // Supprimer plusieurs utilisateurs
  deleteMultipleUtilisateurs(ids: string[]): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.delete(`${this.apiUrl}`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      }),
      body: { ids }
    });
  }

  // Mettre à jour un utilisateur
  updateUtilisateur(id: string, utilisateur: any): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.put(`${this.apiUrl}/${id}`, utilisateur, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    });
  }

  // Lister tous les historiques
  listHistoriques(): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.historiqueUrl}`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    });
  }
}
