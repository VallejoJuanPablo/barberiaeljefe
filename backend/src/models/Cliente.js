const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  codigo: { type: String, unique: true },
  nombre: { type: String, required: true },
  telefono: { type: String, default: '' },
  email: { type: String, default: '' },
  membresia: {
    activa: { type: Boolean, default: false },
    tipo: { type: String, default: '' },
    fechaInicio: { type: Date },
    fechaFin: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
});

// Auto-generate codigo if not provided
clienteSchema.pre('save', async function() {
  if (!this.codigo) {
    const count = await mongoose.model('Cliente').countDocuments();
    this.codigo = 'BEJ-' + String(count + 1).padStart(4, '0');
  }
});

module.exports = mongoose.model('Cliente', clienteSchema);
