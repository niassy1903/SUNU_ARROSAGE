// pompe.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PompeService {
  private raspberryPiUrl = 'http://localhost:5001';
  private pumpStateSubject = new BehaviorSubject<boolean>(false);
  pumpState$ = this.pumpStateSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initPumpState();
  }

  private initPumpState() {
    this.getPumpState().subscribe({
      next: (response) => {
        if (response.success) {
          this.pumpStateSubject.next(response.pumpState);
        }
      },
      error: (error) => console.error('Erreur lors de l\'initialisation de l\'état de la pompe:', error)
    });
  }

  togglePump(state: boolean): Observable<any> {
    return this.http.post(`${this.raspberryPiUrl}/api/pump/control`, {
      state: state ? 'on' : 'off'
    }).pipe(
      tap((response: any) => {
        if (response.success) {
          this.pumpStateSubject.next(response.state);
        }
      })
    );
  }

  getPumpState(): Observable<{ pumpState: boolean; success: boolean }> {
    return this.http.get<{ pumpState: boolean; success: boolean }>(
      `${this.raspberryPiUrl}/api/pump/state`
    );
  }
}