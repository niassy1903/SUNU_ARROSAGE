import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SensorDataService {
  private apiUrl = 'http://localhost:3000/api/sensors'; // Endpoint général

  constructor(private http: HttpClient) {}

  // Récupérer l'humidité et la luminosité ensemble
  getSensorData(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Récupérer uniquement l'humidité
  getHumidity(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/humidity`);
  }

  // Récupérer uniquement la luminosité
  getLight(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/light`);
  }
}
