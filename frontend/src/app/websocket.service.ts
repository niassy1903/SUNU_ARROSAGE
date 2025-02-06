import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';  // Importer 'io' et 'Socket' de 'socket.io-client'

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket: Socket;

  constructor() {
    // Créer une connexion WebSocket avec le serveur
    this.socket = io('http://localhost:3000');  // URL du serveur WebSocket
  }

  // Méthode pour envoyer un événement de scan RFID
  sendRFIDScan(rfid: string) {
    this.socket.emit('scanRFID', rfid);
  }

  // Méthode pour recevoir la réponse du serveur WebSocket
  onRFIDResponse(callback: (response: any) => void) {
    this.socket.on('rfidResponse', callback);
  }

  
  
}
