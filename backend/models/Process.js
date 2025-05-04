const mongoose = require('mongoose');

const processSchema = new mongoose.Schema({
  name: { type: String, required: false },
  abbreviation: { type: String, required: false },
  processPurpose: { type: String, required: false },
  description: { type: String },
  processGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ProcessGroup', required: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: false },
  isChildOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Process', required: false },
  workProducts: [{
    workProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProduct', required: true },
    known: { type: Number, default: 0, min: 0 },
    unknown: { type: Number, default: 0, min: 0 },
  }],
  bpmnPositions: {
    type: Map,
    of: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    default: {},
  },
  bpmnEdges: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
  bpmnLaneDimensions: {
    type: Map,
    of: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    default: {},
  },
  flowPositions: {
    type: Map,
    of: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    default: {},
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Process', processSchema);