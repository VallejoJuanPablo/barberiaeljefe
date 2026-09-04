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
beneficioRelampagoSchema.pre('validate', function (next) {
  if (this.fechaHasta && this.fechaDesde && this.fechaHasta < this.fechaDesde) {
    this.invalidate('fechaHasta', 'La fecha hasta debe ser igual o posterior a la fecha desde');
  }
  next();
});

module.exports = mongoose.model('BeneficioRelampago', beneficioRelampagoSchema);
