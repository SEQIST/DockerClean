const mongoose = require('mongoose');

const roleAvailabilitySchema = new mongoose.Schema({
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
  activityId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('RoleAvailability', roleAvailabilitySchema);