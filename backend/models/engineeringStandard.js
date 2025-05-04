// models/engineeringStandard.js
const mongoose = require('mongoose');

const engineeringStandardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  source: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('EngineeringStandard', engineeringStandardSchema);