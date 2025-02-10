// models/schedule.js
const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // Heure de début (ex: "14:00")
  endTime: { type: String, required: true }, // Heure de fin (ex: "15:00")
  created_at: { type: Date, default: Date.now } // Date de création
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;