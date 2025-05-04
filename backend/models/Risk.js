const mongoose = require('mongoose');

const riskSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'RiskCategory' }, // Optional
  status: { type: String },
  title: { type: String, required: true },
  submitter: { type: String },
  description: { type: String, required: true },
  mitigation: { type: String },
  likelihoodBefore: { type: Number, min: 1, max: 5 },
  severityBeforeEstimated: { type: Number, min: 1, max: 5 },
  severityBeforeCalculated: { type: Number, min: 1, max: 5 },
  likelihoodAfter: { type: Number, min: 1, max: 5 },
  severityAfterEstimated: { type: Number, min: 1, max: 5 },
  severityAfterCalculated: { type: Number, min: 1, max: 5 },
  strategy: { type: mongoose.Schema.Types.ObjectId, ref: 'RiskStrategy' }, // Optional
  workProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WorkProduct' }],
});

module.exports = mongoose.model('Risk', riskSchema);