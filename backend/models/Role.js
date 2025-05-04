const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  abbreviation: { type: String, required: true },
  description: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: false },
  subsidiary: { type: mongoose.Schema.Types.ObjectId, default: null }, // Entfernt ref: 'Subsidiary'
  paymentType: { type: String, enum: ['yearly', 'hourly'], default: 'yearly' },
  paymentValue: { type: Number, default: 0 },
  numberOfHolders: { type: Number, default: 1 },
  dailyWorkload: { type: Number, default: null },
  availableDailyHours: { type: Number, default: null },
  rights: { type: String, default: '' },
  supervisorRole: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Role', 
    default: null,
    validate: {
      validator: async function(value) {
        if (!value) return true; // Wenn kein supervisorRole angegeben ist, ist die Validierung erfolgreich
        if (!this._id) {
          // Bei einer Update-Operation ist this._id nicht verfügbar
          // Wir müssen die Rolle manuell abrufen
          const role = await mongoose.model('Role').findById(this.getQuery()._id);
          return role ? value.toString() !== role._id.toString() : true;
        }
        return value.toString() !== this._id.toString();
      },
      message: 'Eine Rolle kann nicht ihr eigener Vorgesetzter sein.'
    }
  },
  subordinateRoles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
}, { timestamps: true });

roleSchema.pre('save', async function(next) {
  if (this.supervisorRole && this.subordinateRoles.includes(this.supervisorRole)) {
    throw new Error('Die Vorgesetztenrolle kann nicht auch eine untergebene Rolle sein.');
  }
  next();
});

const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);
module.exports = Role;