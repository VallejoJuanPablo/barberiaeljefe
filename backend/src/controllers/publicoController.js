const Cliente = require('../models/Cliente');
const Membresia = require('../models/Membresia');
const ConsultaLog = require('../models/ConsultaLog');

// GET /api/publico/membresia?codigo=BEJ-0001
const checkMembresia = async (req, res) => {
  const { codigo } = req.query;

  if (!codigo) {
    return res.status(400).json({ mensaje: 'Se requiere el parámetro codigo' });
  }

  try {
    const cliente = await Cliente.findOne({ codigo: codigo.toUpperCase() });

    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    const ahora = new Date();
    const membresiaVigente =
      cliente.membresia.activa &&
      cliente.membresia.fechaFin &&
      new Date(cliente.membresia.fechaFin) >= ahora;

    // Buscar datos del plan de membresía
    let plan = null;
    if (cliente.membresia.tipo) {
      plan = await Membresia.findOne({ nombre: cliente.membresia.tipo });
    }

    // Grabar log de consulta (fire & forget)
    ConsultaLog.create({
      clienteId: cliente._id,
      codigo: cliente.codigo,
      ip: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || '',
      resultado: membresiaVigente
    }).catch(() => {});

    res.charset = 'utf-8';
    res.json({
      activo: membresiaVigente,
      nombre: cliente.nombre,
      tipo: cliente.membresia.tipo,
      fechaFin: cliente.membresia.fechaFin || null,
      mensaje: membresiaVigente
        ? 'Tu membresía está vigente. ¡Disfrutala!'
        : 'Tu membresía no está activa. Acercate a la barbería para renovarla.',
      plan: plan ? {
        precio: plan.precio,
        incluye: plan.incluye,
        beneficios: plan.beneficios,
        descripcion: plan.descripcion
      } : null
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al verificar la membresía', error: error.message });
  }
};

module.exports = { checkMembresia };
