import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { distinctUntilChanged, throttleTime } from 'rxjs/operators';
import { map } from 'rxjs/operators';
export interface SensorData {
  humidity: string;
  luminosity: string;
}

@Injectable({
  providedIn: 'root'
})
export class SensorServiceTsService {
  private socket: any;
 // private sensorDataSubject = new BehaviorSubject<any>(null);
  private lastData: any = null; // Stocker la dernière valeur reçue pour éviter les doublons
  private sensorDataSubject = new BehaviorSubject<any>({
    humidity: '0%', // Valeur par défaut immédiate
    luminosity: '0 lx' // Valeur par défaut immédiate
  });
  private readonly THROTTLE_TIME = 60000; // 1 seconde
  constructor() {
    this.socket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      console.log('Connected to sensor websocket');
    });

    this.socket.on('sensorData', (data: SensorData) => {
      if (this.isValidData(data)) {
        this.sensorDataSubject.next(this.sanitizeData(data));
      }
    });

    this.socket.on('error', (error: Error) => {
      console.error('Socket error:', error);
    });
  }

  private isValidData(data: any): boolean {
    return data && typeof data.humidity === 'string' && typeof data.luminosity === 'string';
  }

  private sanitizeData(data: SensorData): SensorData {
    return {
      humidity: data.humidity.replace(/[^0-9.]/g, ''),
      luminosity: data.luminosity.replace(/[^0-9.]/g, '')
    };
  }

  getSensorData(): Observable<SensorData> {
    return this.sensorDataSubject.asObservable().pipe(
      throttleTime(this.THROTTLE_TIME),
      distinctUntilChanged((prev, curr) => 
        prev.humidity === curr.humidity && 
        prev.luminosity === curr.luminosity
      ),
      map((data: SensorData) => ({
        humidity: data.humidity,
        luminosity: data.luminosity
      }))
    );
  }
  

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
  
}
