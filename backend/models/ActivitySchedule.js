const mongoose = require('mongoose');

const activityScheduleSchema = new mongoose.Schema({
  activityId: {
    type: String,
    required: true,
  },
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
  durationDays: {
    type: Number,
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

module.exports = mongoose.model('ActivitySchedule', activityScheduleSchema);