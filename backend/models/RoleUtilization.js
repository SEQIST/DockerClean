const mongoose = require('mongoose');

const roleUtilizationSchema = new mongoose.Schema({
  roleId: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  utilizedHours: {
    type: Number,
    required: true,
  },
  activityId: {
    type: String,
    required: true,
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

module.exports = mongoose.model('RoleUtilization', roleUtilizationSchema);