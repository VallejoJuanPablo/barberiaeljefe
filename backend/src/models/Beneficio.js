const mongoose = require('mongoose');

const beneficioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: { type: String, required: true },
  icono: { type: String, default: '' },
  codigo: { type: String, default: '' },
  activo: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Beneficio', beneficioSchema);
