// backend/models/RiskStrategy.js
const mongoose = require('mongoose');

const riskStrategySchema = new mongoose.Schema({
  name: { type: String, required: true, enum: ['Accept', 'Transfer', 'Avoid', 'Reduce'] },
  description: { type: String },
});

module.exports = mongoose.model('RiskStrategy', riskStrategySchema);