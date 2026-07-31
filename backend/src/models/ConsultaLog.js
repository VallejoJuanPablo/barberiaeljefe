const mongoose = require('mongoose');

const consultaLogSchema = new mongoose.Schema({
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  codigo: { type: String, required: true },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  resultado: { type: Boolean, required: true },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ConsultaLog', consultaLogSchema);
