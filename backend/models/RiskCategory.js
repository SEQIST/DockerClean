// backend/models/RiskCategory.js
const mongoose = require('mongoose');

const riskCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
});

module.exports = mongoose.model('RiskCategory', riskCategorySchema);