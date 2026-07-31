const mongoose = require('mongoose');

const beneficioSchema = new mongoose.Schema({
  categoria: { type: String, required: true },
  icono: { type: String, default: '' },
  items: [{ type: String }]
}, { _id: false });

const membresiaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  precio: { type: Number, required: true },
  incluye: [{ type: String }],
  beneficios: [beneficioSchema],
  descripcion: { type: String, default: '' },
  activa: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Membresia', membresiaSchema);
