const mongoose = require('mongoose');

const severityMatrixSchema = new mongoose.Schema({
  level: { type: Number, required: true, unique: true, min: 1, max: 5 },
  description: { type: String, required: true },
  projectCostPercentage: { type: String, required: true }, // Projektkosten in %
  repairTimePercentage: { type: String, required: true }, // Reparaturzeit in % der Projektlaufzeit
});

module.exports = mongoose.model('SeverityMatrix', severityMatrixSchema);