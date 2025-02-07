const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const axios = require('axios');
const { SerialPort, ReadlineParser } = require('serialport'); // Importation du module série

// Créez une application Express
const app = express();
const server = http.createServer(app);

// Créez un serveur WebSocket
const wss = new WebSocket.Server({ server });

// Configuration du port série (modifie COM3 ou /dev/ttyUSB0 selon ton OS)
const port = new SerialPort({
    path: '/dev/ttyACM0', // Remplace par ton port série (ex: COM3 sous Windows)
    baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' })); // Lecture ligne par ligne

// Quand l'Arduino envoie un message
parser.on('data', async (rfid) => {
    console.log(`Donnée reçue de l'Arduino: ${rfid.trim()}`);

    // Envoi au WebSocket (si un client est connecté)
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(rfid.trim());
        }
    });

    // Appel API Laravel pour vérifier le RFID
    try {
        const response = await axios.post('http://localhost:8000/api/login/rfid', {
            carte_rfid: rfid.trim(), // Utiliser le même nom que dans le contrôleur Laravel
        });
        console.log(`Réponse du serveur: ${response.data.message}`);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API :', error);
    }
});

// Quand un client WebSocket se connecte
wss.on('connection', (ws) => {
    console.log('Un client est connecté');
    
    ws.send('Bienvenue sur le serveur WebSocket!');

    ws.on('close', () => {
        console.log('Le client a quitté');
    });
});

// Démarrer le serveur
server.listen(3000, () => {
    console.log('Serveur WebSocket en cours d\'exécution sur le port 3000');
});
