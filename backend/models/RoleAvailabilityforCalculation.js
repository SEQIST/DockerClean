const mongoose = require('mongoose');

const roleAvailabilityforCalculationSchema = new mongoose.Schema({
  roleId: {
    type: String,
    required: true,
  },
  availableFrom: {
    type: Date,
    required: true,
  },
  availableHoursPerDay: {
    type: Number,
    required: true,
  },
  restrictedHoursPerDay: {
    type: Number,
    default: 0,
  },
  restrictedUntil: {
    type: Date,
    default: null,
  },
  projectId: {
    type: String,
    default: null,
  },
  processId: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model('RoleAvailabilityforCalculation', roleAvailabilityforCalculationSchema);