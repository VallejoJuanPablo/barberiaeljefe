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
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Auto-generate codigo if not provided
clienteSchema.pre('save', async function() {
  if (!this.codigo) {
    const ultimo = await mongoose.model('Cliente')
      .findOne({}, { codigo: 1 })
      .sort({ codigo: -1 });
    let siguiente = 1;
    if (ultimo?.codigo) {
      const num = parseInt(ultimo.codigo.replace('BEJ-', ''), 10);
      if (!isNaN(num)) siguiente = num + 1;
    }
    this.codigo = 'BEJ-' + String(siguiente).padStart(4, '0');
  }
});

module.exports = mongoose.model('Cliente', clienteSchema);
