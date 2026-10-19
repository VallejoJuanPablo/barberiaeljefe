const mongoose = require('mongoose');

const empresaSchema = new mongoose.Schema({
  codigo: { type: String, unique: true },
  nombre: { type: String, required: true },
  contacto: { type: String, required: true },
  telefono: { type: String, default: '' },
  email: { type: String, default: '' },
  membresiaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Membresia', required: true },
  pack: { type: Number, required: true, min: 1 },
  precioMensual: { type: Number, required: true, min: 0 },
  estado: { type: String, enum: ['activa', 'suspendida', 'baja'], default: 'activa' },
  fechaAlta: { type: Date, default: Date.now },
  ultimoPago: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Auto-generate codigo EMP-XXX
empresaSchema.pre('save', async function () {
  if (!this.codigo) {
    const ultima = await mongoose.model('Empresa')
      .findOne({}, { codigo: 1 })
      .sort({ codigo: -1 });
    let siguiente = 1;
    if (ultima?.codigo) {
      const num = parseInt(ultima.codigo.replace('EMP-', ''), 10);
      if (!isNaN(num)) siguiente = num + 1;
    }
    this.codigo = 'EMP-' + String(siguiente).padStart(3, '0');
  }
});

module.exports = mongoose.model('Empresa', empresaSchema);
