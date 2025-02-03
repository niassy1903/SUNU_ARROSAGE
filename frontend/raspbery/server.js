// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Irrigation = require('./model/irrigation');
const Schedule = require('./model/planing');
const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/sunuarrosage', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connexion à MongoDB réussie !"))
.catch(err => console.error("Erreur de connexion à MongoDB", err));

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

//port dans lequel demarre le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});