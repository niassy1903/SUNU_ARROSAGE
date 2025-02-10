const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Irrigation = require('./model/irrigation');
const Schedule = require('./model/planing');
const PumpState = require('./model/pumpState');
const { Client } = require('ssh2');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const raspberryPiConfig = {
  host: '192.168.1.7',
  port: 22,
  username: 'khalifa',
  password: 'khalifa87'
};

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/sunuarrosage', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connexion à MongoDB réussie !"))
.catch(err => console.error("Erreur de connexion à MongoDB", err));

io.on('connection', (socket) => {
  console.log('Un client s\'est connecté');

  const conn = new Client();
  conn.on('ready', () => {
    console.log("Connexion SSH établie avec le Raspberry Pi !");

    const command = 'python3 /home/khalifa/read_sensors.py';

    conn.exec(command, (err, stream) => {
      if (err) {
        conn.end();
        return;
      }

      stream.on('data', (data) => {
        const sensorData = data.toString();
        console.log(`Données du capteur : ${sensorData}`);
        socket.emit('sensorData', sensorData);
      });

      stream.on('close', () => {
        conn.end();
      });
    });
  }).connect(raspberryPiConfig);

  socket.on('disconnect', () => {
    console.log('Un client s\'est déconnecté');
  });
});


// Route pour obtenir les données des capteurs
app.get('/api/sensor-data', (req, res) => {
  const conn = new Client();
  conn.on('ready', () => {
    console.log("Connexion SSH établie avec le Raspberry Pi !");

    const command = 'python3 /home/khalifa/ardi.py';

    conn.exec(command, (err, stream) => {
      if (err) {
        conn.end();
        return res.status(500).json({ error: "Erreur lors de l'exécution du script." });
      }

      stream.on('data', (data) => {
        console.log(`Données du capteur : ${data.toString()}`);
        res.write(`data: ${data.toString()}\n\n`);
      });

      stream.on('close', () => {
        conn.end();
        res.end();
      });
    });
  }).on('error', (err) => {
    console.error("Erreur de connexion SSH :", err);
    res.status(500).json({ error: "Impossible de se connecter au Raspberry Pi." });
  }).connect(raspberryPiConfig);
});

// Port sur lequel démarre le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
