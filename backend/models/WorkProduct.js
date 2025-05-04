const mongoose = require('mongoose');

const workProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  number: { type: String, required: false }, // Abkürzung optional machen
  uid: { type: String, unique: true }, // Neues Feld für UID
  useMode: { 
    type: String, 
    enum: ['None', 'Internal', 'FromCustomer', 'FromSupplier', 'ToCustomer'], 
    default: 'Internal' // Standardwert auf Internal setzen
  },
  cost: { type: Number, default: null },
  digitalisierbarDurch: { type: [String], default: [] }, // Neues Feld für Digitalisierungsoptionen
}, {
  timestamps: true
});

// Middleware zum Generieren der UID vor dem Speichern
workProductSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isModified('number')) {
    this.uid = `${this.name}#${this.number || ''}`; // UID als Name#+Abkürzung
  }
  next();
});

module.exports = mongoose.model('WorkProduct', workProductSchema);