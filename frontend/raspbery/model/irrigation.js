// models/irrigation.js
const mongoose = require('mongoose');

const irrigationSchema = new mongoose.Schema({
  humiditer: { type: String, required: true },
  luminositer: { type: String, required: true },
  heure: { type: Date, default: Date.now }, // Heure actuelle par défaut
  date_arrosage: { type: Date, default: Date.now }, // Date actuelle par défaut
  volume_arroser: { type: Number, required: true },
  type_arrosage: { type: String, enum: ['manuelle', 'automatique'], required: true },
  moyenne_humiditer: { type: Number }, // Champ pour stocker la moyenne d'humidité
  moyenne_luminositer: { type: Number }, // Champ pour stocker la moyenne de luminosité
  moyenne_volume_arroser: { type: Number } // Champ pour stocker la moyenne de volume d'eau
});

const Irrigation = mongoose.model('Irrigation', irrigationSchema);

module.exports = Irrigation;