// server.js

const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const axios = require('axios'); // Assurez-vous d'installer axios

// Créez une application Express
const app = express();
const server = http.createServer(app);

// Créez un serveur WebSocket
const wss = new WebSocket.Server({ server });

// Quand un client se connecte
wss.on('connection', (ws) => {
    console.log('Un client est connecté');
    
    // Envoyer un message au client
    ws.send('Bienvenue dans le serveur WebSocket!');

    // Écouter les messages du client
    ws.on('message', async (message) => {
        console.log('Message reçu: ', message);
        
        // Appel de l'API Laravel pour login avec RFID
        try {
            const response = await axios.post('http://localhost:8000/api/login/rfid', {
                rfid: message.trim(),
            });
            ws.send(`Réponse du serveur: ${response.data.message}`);
        } catch (error) {
            console.error('Erreur lors de l\'appel à l\'API :', error);
            ws.send('Erreur lors de la connexion.');
        }
    });

    // Quand la connexion est fermée
    ws.on('close', () => {
        console.log('Le client a quitté');
    });
});

// Démarrer le serveur
server.listen(3000, () => {
    console.log('Serveur WebSocket en cours d\'exécution sur le port 3000');
});
