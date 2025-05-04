// models/engineeringContent.js
const mongoose = require('mongoose');

const engineeringContentSchema = new mongoose.Schema({
  engineeringStandard: { type: mongoose.Schema.Types.ObjectId, ref: 'EngineeringStandard', required: true },
  text: { type: String, required: true },
  type: { type: String, enum: ['Header', 'Definition', 'Information', 'Requirement'], default: 'Information' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('EngineeringContent', engineeringContentSchema);