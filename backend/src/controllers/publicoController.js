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

    // Buscar datos del plan de membresía con beneficios poblados
    let plan = null;
    if (cliente.membresia.tipo) {
      plan = await Membresia.findOne({ nombre: cliente.membresia.tipo }).populate('beneficios');
    }

    // Grabar log de consulta (fire & forget)
    ConsultaLog.create({
      clienteId: cliente._id,
      codigo: cliente.codigo,
      ip: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || '',
      resultado: membresiaVigente
    }).catch(() => {});

    // Agrupar beneficios por categoría para la respuesta
    let beneficiosAgrupados = [];
    if (plan && plan.beneficios) {
      const map = new Map();
      for (const ben of plan.beneficios) {
        if (!ben.activo) continue;
        if (!map.has(ben.categoria)) {
          map.set(ben.categoria, { categoria: ben.categoria, icono: ben.icono, items: [] });
        }
        const entry = map.get(ben.categoria);
        if (!entry.icono && ben.icono) entry.icono = ben.icono;
        entry.items.push({ nombre: ben.nombre, codigo: ben.codigo || null });
      }
      beneficiosAgrupados = Array.from(map.values());
    }

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
        beneficios: beneficiosAgrupados,
        descripcion: plan.descripcion
      } : null
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al verificar la membresía', error: error.message });
  }
};

// GET /api/publico/planes — Lista planes activos (sin auth, sin códigos promocionales)
const getPlanes = async (req, res) => {
  try {
    const planes = await Membresia.find({ activa: true }).populate('beneficios').sort({ precio: 1 });
    // Ocultar códigos promocionales — solo se muestran al verificar membresía
    const planesSinCodigos = planes.map(p => {
      const obj = p.toObject();
      obj.beneficios = obj.beneficios.map(({ codigo, ...ben }) => ben);
      return obj;
    });
    res.charset = 'utf-8';
    res.json(planesSinCodigos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener planes', error: error.message });
  }
};

// GET /api/publico/marcas — Marcas activas (sin auth)
const getMarcasPublicas = async (req, res) => {
  try {
    const Marca = require('../models/Marca');
    const marcas = await Marca.find({ activa: true }).sort({ orden: 1, nombre: 1 });
    res.charset = 'utf-8';
    res.json(marcas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener marcas', error: error.message });
  }
};

// GET /api/publico/beneficios-relampago — Beneficios relámpago vigentes (sin auth)
const getBeneficiosRelampagoVigentes = async (req, res) => {
  try {
    const BeneficioRelampago = require('../models/BeneficioRelampago');
    const ahora = new Date();
    const beneficios = await BeneficioRelampago.find({
      activa: true,
      fechaDesde: { $lte: ahora },
      fechaHasta: { $gte: ahora }
    }).sort({ fechaHasta: 1 });
    res.charset = 'utf-8';
    res.json(beneficios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener beneficios relámpago', error: error.message });
  }
};

module.exports = { checkMembresia, getPlanes, getMarcasPublicas, getBeneficiosRelampagoVigentes };
