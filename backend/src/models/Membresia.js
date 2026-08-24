const mongoose = require('mongoose');

const membresiaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  precio: { type: Number, required: true },
  incluye: [{ type: String }],
  beneficios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Beneficio' }],
  descripcion: { type: String, default: '' },
  activa: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Membresia', membresiaSchema);
