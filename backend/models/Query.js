// backend/models/Query.js
const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  name: { type: String, required: true },
  entity: { type: String, required: true },
  fields: { type: [String], required: true },
  dependencies: { type: [String], default: [] },
  dependencyFields: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Query', querySchema);