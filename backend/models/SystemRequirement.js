const mongoose = require('mongoose');

const SystemRequirementSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  header: { type: String, default: '' },
  text: { type: String, required: true }, // RTF-Text
  parentId: { type: String, default: null }, // Für die Hierarchie
  traces: {
    customerRequirementId: { type: String, required: true }, // Vorwärts-Trace
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SystemRequirement', SystemRequirementSchema);