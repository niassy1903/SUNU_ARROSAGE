import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:8000/api/utilisateurs'; // Remplacez par l'URL de votre API
  private apiUrl1 = 'http://localhost:8000/api'; // Remplacez par l'URL de votre API

  constructor(private http: HttpClient) { }

  // Créer un utilisateur
  createUtilisateur(utilisateur: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, utilisateur);
  }

  // Lister tous les utilisateurs
  listUtilisateurs(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  // Récupérer un utilisateur spécifique
  getUtilisateur(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Supprimer un utilisateur
  deleteUtilisateur(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Supprimer plusieurs utilisateurs
  deleteMultipleUtilisateurs(ids: string[]): Observable<any> {
    return this.http.delete(`${this.apiUrl}`, { body: { ids } });
  }

  // Mettre à jour un utilisateur
  updateUtilisateur(id: string, utilisateur: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, utilisateur);
  }


  // Récupérer les enregistrements d'historique
  getHistorique(): Observable<any> {
    return this.http.get(`${this.apiUrl1}/historiques`);
  }


  
   // Connexion par code secret
   loginByCode(codeSecret: string): Observable<{ token: string, user: { prenom: string, nom: string, role: string } }> {
    return this.http.post<{ token: string, user: { prenom: string, nom: string, role: string } }>(
      `${this.apiUrl1}/login-by-code`, 
      { code_secret: codeSecret }
    ).pipe(
      map(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('prenom', response.user.prenom);
          localStorage.setItem('nom', response.user.nom);
          localStorage.setItem('role', response.user.role);
        }
        return response;
      })
    );
  }
  

// Déconnexion
logout(): Observable<any> {
  const token = localStorage.getItem('token');
  return this.http.post(`${this.apiUrl1}/logout`, {}, {
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



}