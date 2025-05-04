const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }, // Nicht erforderlich
  plannedStartDate: { type: Date },
  plannedEndDate: { type: Date },
  plannedBudget: { type: Number },
  resourcesSummary: { type: String },
  calculatedCost: { type: Number },
  workProducts: [
    {
      workProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProduct' },
      knownItems: { type: Number, default: 0 },
      unknownItems: { type: Number, default: 0 },
    },
  ],
  releases: [
    {
      name: { type: String, required: true },
      startDate: { type: String, required: true },
      endDate: { type: String, required: true },
      workProducts: [
        {
          workProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProduct' },
          knownItems: { type: Number, default: 0 },
          unknownItems: { type: Number, default: 0 },
        },
      ],
    },
  ],
});

module.exports = mongoose.model('Project', projectSchema);