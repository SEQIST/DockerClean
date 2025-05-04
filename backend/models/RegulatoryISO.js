const mongoose = require('mongoose');

const regulatoryISOSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  source: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RegulatoryISO', regulatoryISOSchema);