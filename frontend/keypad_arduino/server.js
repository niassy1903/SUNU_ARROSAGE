const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const http = require('http');
const { Server } = require('socket.io');

const PORT = 5000;
const SERIAL_PORT = '/dev/ttyACM0';
const BLOCK_DURATION = 30 * 1000;
const MAX_ATTEMPTS = 3;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

try {
  const arduinoPort = new SerialPort({ path: SERIAL_PORT, baudRate: 9600 });
  const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\n' }));
  let failedAttempts = 0;
  let isBlocked = false;
  let blockEndTime = 0;

  parser.on('data', async (data) => {
    data = data.trim();
    console.log('📩 Données reçues depuis Arduino:', data);
  
    try {
      const jsonData = JSON.parse(data);
  
      if (jsonData.status === "Success" && jsonData.uid) {
        console.log('🆔 UID de la carte:', jsonData.uid);
        // Émettre uniquement l'UID vers le client
        io.emit('card_uid', jsonData.uid);
        return; // Ne pas émettre le message JSON complet
      }
  
    } catch (error) {
      console.error('❌ Erreur de parsing JSON:', error.message);
    }
    
    // Fin de l'ajout de la récupération de l'UID

    if (isBlocked) {
      const remainingTime = Math.ceil((blockEndTime - Date.now()) / 1000);
      console.log(`⏳ Utilisateur bloqué. Temps restant : ${remainingTime}s`);
      return;
    }

    // Émettre le code reçu vers le client (une seule fois)
    io.emit('code_secret', data);

    if (data.length === 4) {
      try {
        const response = await fetch('http://localhost:8000/api/login-by-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code_secret: data })
        });

        const result = await response.json();
        if (response.ok) {
          console.log('✅ Connexion réussie:', result);
          io.emit('login_success', result);
          failedAttempts = 0;
        } else {
          console.log('❌ Code incorrect:', result.message);
          io.emit('login_failed');
          failedAttempts++;

          if (failedAttempts >= MAX_ATTEMPTS) {
            isBlocked = true;
            blockEndTime = Date.now() + BLOCK_DURATION;
            console.log(`🚨 Blocage activé pour ${BLOCK_DURATION / 1000} secondes.`);
            io.emit('login_blocked', { remainingTime: BLOCK_DURATION / 1000 });

            setTimeout(() => {
              isBlocked = false;
              failedAttempts = 0;
              console.log('✅ Déblocage automatique.');
              io.emit('login_unblocked');
            }, BLOCK_DURATION);
          }
        }
      } catch (error) {
        console.error('❌ Erreur API:', error.message);
      }
    }
  });
} catch (error) {
  console.error(`❌ Erreur d'ouverture du port série (${SERIAL_PORT}):`, error.message);
}
