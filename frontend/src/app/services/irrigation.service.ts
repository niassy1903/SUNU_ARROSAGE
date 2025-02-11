import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Exportez l'interface pour qu'elle soit accessible depuis d'autres fichiers
export interface IrrigationData {
  moyenne_humiditer: number;
  moyenne_luminositer: number;
  date_arrosage: Date;
}

@Injectable({
  providedIn: 'root'
})

export class IrrigationService {
  private apiUrl = 'http://localhost:5001/api/irrigation';

  constructor(private http: HttpClient) {}

  getLastSevenDaysMeans(): Observable<IrrigationData[]> {
    return this.http.get<IrrigationData[]>(this.apiUrl).pipe(
      map(data => {
        // Trier les données du plus récent au plus ancien
        const sortedData = data.sort((a, b) => 
          new Date(b.date_arrosage).getTime() - new Date(a.date_arrosage).getTime()
        );

        // Créer un objet pour stocker la dernière moyenne par jour
        const uniqueDailyMeans: {[key: string]: IrrigationData} = {};

        sortedData.forEach(entry => {
          const date = new Date(entry.date_arrosage);
          const dateKey = date.toISOString().split('T')[0]; // Clé unique par jour

          // Ne garder que la première (la plus récente) entrée pour chaque jour
          if (!uniqueDailyMeans[dateKey]) {
            uniqueDailyMeans[dateKey] = entry;
          }
        });

        // Convertir l'objet en tableau et prendre les 7 derniers jours
        return Object.values(uniqueDailyMeans)
          .slice(0, 7)
          .sort((a, b) => 
            new Date(a.date_arrosage).getTime() - new Date(b.date_arrosage).getTime()
          );
      })
    );
  }


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

  envoyerIrrigation(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

}