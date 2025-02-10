import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SensorDataService {
  private apiUrl = 'http://localhost:5000/api/sensors'; // Endpoint général
  private waterLevelUrl = 'http://localhost:5000/api/sensors/waterLevel'; // Endpoint pour le niveau d'eau

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

  // Récupérer le niveau d'eau
  getWaterLevel(): Observable<any> {
    return this.http.get<any>(this.waterLevelUrl);
  }
}