const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date },
  workProduct: {
    workProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProduct' },
    knownItems: { type: Number, default: 0 },
    unknownItems: { type: Number, default: 0 },
  },
  release: { type: mongoose.Schema.Types.ObjectId, ref: 'Release', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
});

module.exports = mongoose.model('Event', eventSchema);