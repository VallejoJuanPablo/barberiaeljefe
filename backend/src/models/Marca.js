const mongoose = require('mongoose');

const marcaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  logo: { type: String, default: '' },
  instagram: { type: String, default: '' },
  activa: { type: Boolean, default: true },
  orden: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Marca', marcaSchema);
