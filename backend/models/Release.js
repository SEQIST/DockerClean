const mongoose = require('mongoose');

const releaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  plannedStartDate: { type: Date },
  plannedEndDate: { type: Date },
  workProducts: [
    {
      workProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProduct', required: true },
      knownItems: { type: Number, default: 0 },
      unknownItems: { type: Number, default: 0 },
    },
  ],
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
});

module.exports = mongoose.model('Release', releaseSchema);