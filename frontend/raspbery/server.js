const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('ssh2');
const Irrigation = require('./model/irrigation');
const Schedule = require('./model/planing');
const PumpState = require('./model/pumpState');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const raspberryPiConfig = {
  host: '192.168.1.26',
  port: 22,
  username: 'antamaguette',
  password: 'antamaguette'
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

    const command = 'python3 /home/antamaguette/ardi.py';

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

const calculerMoyennesQuotidiennes = async (date) => {
  const debutJournee = new Date(date);
  debutJournee.setHours(0, 0, 0, 0);

  const finJournee = new Date(date);
  finJournee.setHours(23, 59, 59, 999);

  const donneesJournee = await Irrigation.find({
    date_arrosage: { $gte: debutJournee, $lte: finJournee }
  });

  if (donneesJournee.length === 0) {
    return {
      moyenneHumiditer: 0,
      moyenneLuminositer: 0,
      moyenneVolumeArroser: 0
    };
  }

  const extraireNombre = (str) => {
    return parseFloat(str.replace('%', '')) || 0;
  };

  const totalHumiditer = donneesJournee.reduce((sum, entry) =>
    sum + extraireNombre(entry.humiditer), 0
  );

  const totalLuminositer = donneesJournee.reduce((sum, entry) =>
    sum + extraireNombre(entry.luminositer), 0
  );

  const totalVolumeArroser = donneesJournee.reduce((sum, entry) =>
    sum + (entry.volume_arroser || 0), 0
  );

  const moyenneHumiditer = Number((totalHumiditer / donneesJournee.length).toFixed(2));
  const moyenneLuminositer = Number((totalLuminositer / donneesJournee.length).toFixed(2));
  const moyenneVolumeArroser = Number((totalVolumeArroser / donneesJournee.length).toFixed(2));

  await Irrigation.updateMany(
    { date_arrosage: { $gte: debutJournee, $lte: finJournee } },
    {
      $set: {
        moyenne_humiditer: moyenneHumiditer,
        moyenne_luminositer: moyenneLuminositer,
        moyenne_volume_arroser: moyenneVolumeArroser
      }
    }
  );

  return {
    moyenneHumiditer,
    moyenneLuminositer,
    moyenneVolumeArroser
  };
};

app.post('/api/irrigation', async (req, res) => {
  try {
    const irrigationData = req.body;
    const newIrrigation = new Irrigation(irrigationData);
    await newIrrigation.save();

    const moyennes = await calculerMoyennesQuotidiennes(newIrrigation.date_arrosage);

    res.status(201).json({
      ...newIrrigation.toObject(),
      moyenne_humiditer: moyennes.moyenneHumiditer,
      moyenne_luminositer: moyennes.moyenneLuminositer,
      moyenne_volume_arroser: moyennes.moyenneVolumeArroser
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout des données', error: err });
  }
});

app.get('/api/irrigation', async (req, res) => {
  try {
    const irrigationData = await Irrigation.find();
    res.status(200).json(irrigationData);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des données', error: err });
  }
});

app.post('/api/schedule', async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const newSchedule = new Schedule({ startTime, endTime });
    await newSchedule.save();
    res.status(201).json(newSchedule);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'horaire', error: err });
  }
});

app.get('/api/schedule', async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.status(200).json(schedules);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des horaires', error: err });
  }
});

app.delete('/api/schedule/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Schedule.findByIdAndDelete(id);
    res.status(200).json({ message: 'Horaire supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'horaire', error: err });
  }
});

let currentHumidityStatus = {
  status: 'sec',
  lastUpdated: new Date()
};

app.post('/api/humidity-status', (req, res) => {
  const { status } = req.body;
  currentHumidityStatus = {
      status: status,
      lastUpdated: new Date()
  };
  res.json(currentHumidityStatus);
});

app.get('/api/humidity-status', (req, res) => {
  res.json(currentHumidityStatus);
});

app.post('/api/pump/control', async (req, res) => {
  try {
    const { state } = req.body;
    if (state !== "on" && state !== "off") {
      return res.status(400).json({ error: "État invalide. Utilisez 'on' ou 'off'." });
    }

    const newPumpState = state === "on";
    const pumpStateEntry = new PumpState({ state: newPumpState });

    const conn = new Client();
    conn.on('ready', () => {
      console.log("✅ Connexion SSH établie avec le Raspberry Pi !");

      const command = `python3 /home/antamaguette/pump.py ${state}`;

      conn.exec(command, async (err, stream) => {
        if (err) {
          conn.end();
          return res.status(500).json({ error: "Erreur lors de l'exécution du script." });
        }

        let output = '';
        stream.on('data', (data) => {
          output += data.toString();
        });

        stream.on('close', async () => {
          conn.end();
          console.log(`🔹 Résultat du script : ${output.trim()}`);

          await pumpStateEntry.save();

          res.json({
            message: output.trim(),
            state: newPumpState,
            success: true
          });
        });
      });
    }).on('error', (err) => {
      console.error("❌ Erreur de connexion SSH :", err);
      res.status(500).json({ error: "Impossible de se connecter au Raspberry Pi." });
    }).connect(raspberryPiConfig);

  } catch (err) {
    res.status(500).json({
      error: "Erreur lors du contrôle de la pompe",
      success: false
    });
  }
});

app.get('/api/pump/state', async (req, res) => {
  try {
    const latestState = await PumpState.findOne().sort({ timestamp: -1 });
    res.json({
      pumpState: latestState ? latestState.state : false,
      success: true
    });
  } catch (err) {
    res.status(500).json({
      error: "Erreur lors de la récupération de l'état de la pompe",
      success: false
    });
  }
});

app.get('/api/pump/history', async (req, res) => {
  try {
    const history = await PumpState.find()
      .sort({ timestamp: -1 })
      .limit(10);
    res.json(history);
  } catch (err) {
    res.status(500).json({
      error: "Erreur lors de la récupération de l'historique",
      success: false
    });
  }
});

app.get('/api/sensor-data', (req, res) => {
  const conn = new Client();
  conn.on('ready', () => {
    console.log("Connexion SSH établie avec le Raspberry Pi !");

    const command = 'python3 /home/antamaguette/ardi.py';

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

let sensorData = { humidity: null, light: null, waterLevel: null };

function fetchSensorData() {
  const conn = new Client();
  conn.on('ready', () => {
    console.log('✅ Connecté au Raspberry Pi');

    const command = 'python3 /home/antamaguette/ardi.py';

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

        const regex = /Humidité : (\d+)%.*Luminosité : (\d+)%.*Niveau d\'eau : (\d+)%/s;
        const matches = output.match(regex);

        if (matches) {
          sensorData = {
            humidity: parseInt(matches[1], 10),
            light: parseInt(matches[2], 10),
            waterLevel: parseInt(matches[3], 10)
          };
        }
      });

      stream.stderr.on('data', (data) => {
        console.error('🚨 Erreur du script:', data.toString());
      });
    });

  }).connect(raspberryPiConfig);
}

app.get('/api/sensors', (req, res) => {
  res.json(sensorData);
});

app.get('/api/sensors/humidity', (req, res) => {
  res.json({ humidity: sensorData.humidity });
});

app.get('/api/sensors/light', (req, res) => {
  res.json({ light: sensorData.light });
});

app.get('/api/sensors/waterLevel', (req, res) => {
  res.json({ waterLevel: sensorData.waterLevel });
});

setInterval(fetchSensorData, 2000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
