const mongoose = require('mongoose');

const regulatoryEvaluationSchema = new mongoose.Schema({
  regulatoryContent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RegulatoryContent',
    required: true,
  },
  type: {
    type: String,
    enum: ['Header', 'Definition', 'Information', 'Requirement'],
    default: 'Information',
  },
  completed: {
    type: Boolean,
    default: false,
  },
  evidencedBy: {
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
    processes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Process' }],
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
    workProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WorkProduct' }],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('RegulatoryEvaluation', regulatoryEvaluationSchema);