const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('ssh2');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

// Configuration SSH
const sshConfig = {
  host: '192.168.1.20',
  port: 22,
  username: 'niassy',
  password: 'niassy1903'
};

// Commande à exécuter sur le Raspberry Pi
const command = 'python3 /home/niassy/ardi.py';

let sensorData = { humidity: null, light: null };

// Fonction pour récupérer les données via SSH
function fetchSensorData() {
  const conn = new Client();
  conn.on('ready', () => {
    console.log('✅ Connecté au Raspberry Pi');
    
    conn.exec(command, (err, stream) => {
      if (err) {
        console.error('❌ Erreur SSH:', err);
        conn.end();
        return;
      }

      stream.on('close', () => {
        console.log('🔌 Connexion SSH fermée.');
        conn.end();
      });

      stream.on('data', (data) => {
        const output = data.toString().trim();
        console.log('📊 Données reçues:', output);

        // Extraction de l'humidité et de la luminosité
        const regex = /Humidité : (\d+)%.*Luminosité : (\d+)%/s;
        const matches = output.match(regex);

        if (matches) {
          sensorData = {
            humidity: parseInt(matches[1], 10),
            light: parseInt(matches[2], 10)
          };
        }
      });

      stream.stderr.on('data', (data) => {
        console.error('🚨 Erreur du script:', data.toString());
      });
    });

  }).connect(sshConfig);
}

// Routes API
app.get('/api/sensors', (req, res) => {
  res.json(sensorData);
});

app.get('/api/sensors/humidity', (req, res) => {
  res.json({ humidity: sensorData.humidity });
});

app.get('/api/sensors/light', (req, res) => {
  res.json({ light: sensorData.light });
});

// Mise à jour des données toutes les 5 secondes
setInterval(fetchSensorData, 5000);

app.listen(PORT, () => {
  console.log(`🚀 Serveur API actif sur http://localhost:${PORT}`);
});
