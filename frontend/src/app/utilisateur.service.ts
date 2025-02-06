// src/app/utilisateur.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = 'http://localhost:8000/api/utilisateurs'; // Remplacez par l'URL de votre API

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




}
