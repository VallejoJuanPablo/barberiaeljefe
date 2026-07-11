const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  telefono: { type: String, default: '' },
  email: { type: String, default: '' },
  membresia: {
    activa: { type: Boolean, default: false },
    tipo: { type: String, enum: ['basica', 'premium', 'vip'], default: 'basica' },
    fechaInicio: { type: Date },
    fechaFin: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
});

// Auto-generate codigo if not provided
clienteSchema.pre('save', async function(next) {
  if (!this.codigo) {
    const count = await mongoose.model('Cliente').countDocuments();
    this.codigo = 'BEJ-' + String(count + 1).padStart(4, '0');
  }
  next();
});

module.exports = mongoose.model('Cliente', clienteSchema);
