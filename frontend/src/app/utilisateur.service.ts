// src/app/utilisateur.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:8000/api/utilisateurs'; // Remplacez par l'URL de votre API

  private apiUrl1 = 'http://localhost:8000/api'; // Remplacez par l'URL de votre API

  constructor(private http: HttpClient) { }

  // Récupérer tous les historiques
getHistoriques(): Observable<any> {
  return this.http.get(`http://localhost:8000/api/historiques`);
}

// Récupérer les historiques d'un utilisateur spécifique
getHistoriquesByUser(userId: string): Observable<any> {
  return this.http.get(`http://localhost:8000/api/historiques/${userId}`);
}

// Filtrer les historiques par date
filterHistoriquesByDate(date: string): Observable<any> {
  return this.http.get(`http://localhost:8000/api/historiques/filter?date=${date}`);
}


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
// Bloquer plusieurs utilisateurs
blockMultipleUtilisateurs(ids: string[]): Observable<any> {
  return this.http.post(`${this.apiUrl}/block-multiple`, { ids });
}

// Changer le rôle d'un utilisateur
switchRole(id: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/switch-role/${id}`, {});
}


// Importer des utilisateurs via CSV
importCsv(formData: FormData): Observable<any> {
  return this.http.post(`${this.apiUrl}/import-csv`, formData);
}// Assigner une carte à un utilisateur

assignCard(id: string, carteRfid: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/assigner-carte/${id}`, { carte_rfid: carteRfid });
}

 // Connexion par code secret
 loginByCode(codeSecret: string): Observable<{ token: string, user: { prenom: string, nom: string, role: string } }> {
  return this.http.post<{ token: string, user: { nom: string, prenom: string, role: string } }>(
    `${this.apiUrl1}/login-by-code`, 
    { code_secret: codeSecret }
  ).pipe(
    map((response: { token: string, user: { prenom: string, nom: string, role: string } }) => {
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
  headers: new HttpHeaders({
    'Authorization': `Bearer ${token}`
  })
}).pipe(
  tap(() => {
    // Suppression des informations dans le localStorage après déconnexion réussie
    localStorage.removeItem('token');
    localStorage.removeItem('prenom');
    localStorage.removeItem('nom');
    localStorage.removeItem('role');
  })
);
}






}




