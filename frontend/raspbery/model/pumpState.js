// models/pumpState.js
const mongoose = require('mongoose');

const pumpStateSchema = new mongoose.Schema({
  state: {
    type: Boolean,
    required: true,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  lastModifiedBy: {
    type: String,
    default: 'system'
  }
});

module.exports = mongoose.model('PumpState', pumpStateSchema);