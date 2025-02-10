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

    const command = 'python3 /home/ardi.py';

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

// Fonction pour calculer les moyennes quotidiennes
const calculerMoyennesQuotidiennes = async (date) => {
  const debutJournee = new Date(date);
  debutJournee.setHours(0, 0, 0, 0);

  const finJournee = new Date(date);
  finJournee.setHours(23, 59, 59, 999);

  // Récupérer toutes les données de la journée jusqu'à maintenant
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

  // Calcul des moyennes avec les données existantes plus la nouvelle
  const totalHumiditer = donneesJournee.reduce((sum, entry) =>
    sum + extraireNombre(entry.humiditer), 0
  );

  const totalLuminositer = donneesJournee.reduce((sum, entry) =>
    sum + extraireNombre(entry.luminositer), 0
  );

  const totalVolumeArroser = donneesJournee.reduce((sum, entry) =>
    sum + (entry.volume_arroser || 0), 0
  );

  // Calcul des nouvelles moyennes
  const moyenneHumiditer = Number((totalHumiditer / donneesJournee.length).toFixed(2));
  const moyenneLuminositer = Number((totalLuminositer / donneesJournee.length).toFixed(2));
  const moyenneVolumeArroser = Number((totalVolumeArroser / donneesJournee.length).toFixed(2));

  // Mettre à jour toutes les entrées de la journée avec les nouvelles moyennes
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

// Route pour créer une nouvelle entrée d'irrigation
app.post('/api/irrigation', async (req, res) => {
  try {
    const irrigationData = req.body;

    // D'abord, sauvegarder la nouvelle entrée
    const newIrrigation = new Irrigation(irrigationData);
    await newIrrigation.save();

    // Ensuite, recalculer les moyennes pour la journée
    const moyennes = await calculerMoyennesQuotidiennes(newIrrigation.date_arrosage);

    // La réponse inclut l'entrée avec les moyennes mises à jour
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

// Route pour obtenir toutes les entrées d'irrigation
app.get('/api/irrigation', async (req, res) => {
  try {
    const irrigationData = await Irrigation.find();
    res.status(200).json(irrigationData);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des données', error: err });
  }
});

// Route pour ajouter un horaire de planification
app.post('/api/schedule', async (req, res) => {
  try {
    const { startTime, endTime } = req.body;

    // Créer un nouvel horaire
    const newSchedule = new Schedule({
      startTime,
      endTime
    });

    // Sauvegarder dans la base de données
    await newSchedule.save();

    res.status(201).json(newSchedule);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout de l\'horaire', error: err });
  }
});

// Route pour récupérer tous les horaires de planification
app.get('/api/schedule', async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.status(200).json(schedules);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des horaires', error: err });
  }
});

// Route pour supprimer un horaire de planification
app.delete('/api/schedule/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Supprimer l'horaire par son ID
    await Schedule.findByIdAndDelete(id);

    res.status(200).json({ message: 'Horaire supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'horaire', error: err });
  }
});

// Route pour stocker le statut d'humidité
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

// Route pour récupérer le statut d'humidité
app.get('/api/humidity-status', (req, res) => {
  res.json(currentHumidityStatus);
});

// Route pour contrôler la pompe via le Raspberry Pi
app.post('/api/pump/control', async (req, res) => {
  try {
    const { state } = req.body;
    if (state !== "on" && state !== "off") {
      return res.status(400).json({ error: "État invalide. Utilisez 'on' ou 'off'." });
    }

    const newPumpState = state === "on";

    // Créer une nouvelle entrée d'état
    const pumpStateEntry = new PumpState({
      state: newPumpState
    });

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

          // Sauvegarder l'état dans MongoDB
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

// Route pour obtenir l'état actuel de la pompe
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

// Route optionnelle pour obtenir l'historique des états de la pompe
app.get('/api/pump/history', async (req, res) => {
  try {
    const history = await PumpState.find()
      .sort({ timestamp: -1 })
      .limit(10); // Limiter aux 10 derniers changements d'état
    res.json(history);
  } catch (err) {
    res.status(500).json({
      error: "Erreur lors de la récupération de l'historique",
      success: false
    });
  }
});

// Route pour obtenir les données des capteurs
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



//automatique


// Fonction de vérification des horaires et déclenchement de la pompe
const checkWateringSchedules = () => {
  // Lancer la vérification des horaires planifiés toutes les 60 secondes
  setInterval(async () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();  // Temps actuel en minutes

    // Récupérer les horaires planifiés
    const schedules = await Schedule.find();

    schedules.forEach(schedule => {
      const [startHours, startMinutes] = schedule.startTime.split(':');
      const startTimeInMinutes = parseInt(startHours) * 60 + parseInt(startMinutes);

      // Si l'heure actuelle correspond à l'heure planifiée, activer la pompe
      if (currentTime === startTimeInMinutes) {
        activatePump();
      }
    });
  }, 60000);  // Vérifier toutes les minutes
};

// Fonction pour activer la pompe
const activatePump = async () => {
  try {
    // Créer une connexion SSH avec le Raspberry Pi
    const conn = new Client();
    
    conn.on('ready', () => {
      console.log("Connexion SSH établie avec le Raspberry Pi !");
      
      // Commande pour activer la pompe (changer 'on' pour 'off' selon l'état)
      const command = 'python3 /home/antamaguette/pump.py on';  // Remplacer 'on' par 'off' si nécessaire
      
      conn.exec(command, (err, stream) => {
        if (err) {
          console.error("Erreur lors de l'exécution de la commande : ", err);
          conn.end();
          return;
        }
        
        stream.on('data', (data) => {
          console.log(`Sortie de la commande : ${data.toString()}`);
        });
        
        stream.on('close', () => {
          console.log("Commande exécutée avec succès !");
          conn.end();
        });
      });
    }).on('error', (err) => {
      console.error("Erreur de connexion SSH :", err);
    }).connect(raspberryPiConfig);
  } catch (err) {
    console.error("Erreur lors de l'activation de la pompe :", err);
  }
};
// Lancer la vérification des horaires planifiés
checkWateringSchedules();

// Port sur lequel démarre le serveur
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});