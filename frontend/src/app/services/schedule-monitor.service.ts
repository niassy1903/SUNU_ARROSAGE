//verifie planification
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { PompeService } from './pompe.service';

@Injectable({
  providedIn: 'root'
})
export class ScheduleMonitorService {
  constructor(private http: HttpClient, private pompeService: PompeService) {}

  startMonitoring() {
    // Vérifie toutes les secondes
    interval(1000).pipe(
      switchMap(() => this.http.get<Array<{ startTime: string, endTime: string }>>('/api/schedules'))
    ).subscribe(schedules => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('fr-FR', { hour12: false });

      schedules.forEach(schedule => {
        if (schedule.startTime === currentTime) {
          this.pompeService.togglePump(true).subscribe(response => {
            if (response.success) {
              console.log('Pompe déclenchée automatiquement');
            } else {
              console.error('Erreur lors du déclenchement de la pompe');
            }
          });
        }
      });
    });
  }
}