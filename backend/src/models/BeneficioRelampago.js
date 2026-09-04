const mongoose = require('mongoose');

const beneficioRelampagoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  fechaDesde: { type: Date, required: true },
  fechaHasta: { type: Date, required: true },
  activa: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Validar que fechaHasta >= fechaDesde
beneficioRelampagoSchema.path('fechaHasta').validate(function (value) {
  return !this.fechaDesde || !value || value >= this.fechaDesde;
}, 'La fecha hasta debe ser igual o posterior a la fecha desde');

module.exports = mongoose.model('BeneficioRelampago', beneficioRelampagoSchema);
