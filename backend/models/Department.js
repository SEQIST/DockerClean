const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, trim: true },
  isJuniorTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  headOfDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: null }, // Neues Feld
});

module.exports = mongoose.model('Department', departmentSchema);