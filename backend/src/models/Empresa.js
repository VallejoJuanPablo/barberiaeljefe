const mongoose = require('mongoose');

const PACKS_VALIDOS = [10, 20, 30, 50];
const DESCUENTO_CORPORATIVO = 0.25;

const empresaSchema = new mongoose.Schema({
  codigo: { type: String, unique: true },
  nombre: { type: String, required: true },
  contacto: { type: String, required: true },
  telefono: { type: String, default: '' },
  email: { type: String, default: '' },
  pack: { type: Number, required: true, enum: PACKS_VALIDOS },
  precioMensual: { type: Number },
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

// Calcular precio: pack × precioMembresia × 0.25
empresaSchema.pre('save', async function () {
  if (this.isModified('pack') || !this.precioMensual) {
    const Membresia = mongoose.model('Membresia');
    const plan = await Membresia.findOne({ activa: true }).sort({ precio: 1 });
    const precioBase = plan?.precio || 2000;
    this.precioMensual = this.pack * precioBase * DESCUENTO_CORPORATIVO;
  }
});

module.exports = mongoose.model('Empresa', empresaSchema);
module.exports.PACKS_VALIDOS = PACKS_VALIDOS;
