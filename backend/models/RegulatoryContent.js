const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const regulatoryContentSchema = new mongoose.Schema({
  regulatoryISO: { type: mongoose.Schema.Types.ObjectId, ref: 'RegulatoryISO', required: true },
  text: { type: String, required: true },
  type: { type: String, enum: ['Header', 'Definition', 'Information', 'Requirement'], default: 'Information' },
  createdAt: { type: Date, default: Date.now },
});

regulatoryContentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('RegulatoryContent', regulatoryContentSchema);