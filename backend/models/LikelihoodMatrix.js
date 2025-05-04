const mongoose = require('mongoose');

const likelihoodMatrixSchema = new mongoose.Schema({
  level: { type: Number, required: true, unique: true, min: 1, max: 5 },
  description: { type: String, required: true },
  probability: { type: String, required: true }, // Wahrscheinlichkeit in %
});

module.exports = mongoose.model('LikelihoodMatrix', likelihoodMatrixSchema);