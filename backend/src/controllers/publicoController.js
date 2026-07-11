const Cliente = require('../models/Cliente');

// GET /api/publico/membresia?codigo=BEJ-0001
// Retorna estado de membresía sin datos sensibles
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

    res.json({
      activo: membresiaVigente,
      nombre: cliente.nombre,
      tipo: cliente.membresia.tipo,
      fechaFin: cliente.membresia.fechaFin || null
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al verificar la membresía', error: error.message });
  }
};

module.exports = { checkMembresia };
