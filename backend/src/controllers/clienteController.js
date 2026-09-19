const Cliente = require('../models/Cliente');

// GET /api/clientes — Obtener clientes (?deleted=true para ver borrados)
const getClientes = async (req, res) => {
  try {
    const filtro = req.query.deleted === 'true'
      ? { deletedAt: { $ne: null } }
      : { deletedAt: null };
    const clientes = await Cliente.find(filtro).sort({ createdAt: -1 });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener clientes', error: error.message });
  }
};

// GET /api/clientes/:id — Obtener un cliente por ID
const getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el cliente', error: error.message });
  }
};

// POST /api/clientes — Crear un nuevo cliente
const createCliente = async (req, res) => {
  try {
    const cliente = new Cliente(req.body);
    await cliente.save();
    res.status(201).json(cliente);
  } catch (error) {
    if (error.code === 11000) {
      const campo = Object.keys(error.keyPattern || {})[0] || 'codigo';
      return res.status(400).json({ mensaje: `Ya existe un cliente con ese ${campo}` });
    }
    if (error.name === 'ValidationError') {
      const campos = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ mensaje: campos.join('. ') });
    }
    res.status(500).json({ mensaje: 'Error al crear el cliente. Intentá de nuevo.' });
  }
};

// PUT /api/clientes/:id — Actualizar un cliente
const updateCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (error) {
    if (error.code === 11000) {
      const campo = Object.keys(error.keyPattern || {})[0] || 'codigo';
      return res.status(400).json({ mensaje: `Ya existe un cliente con ese ${campo}` });
    }
    if (error.name === 'ValidationError') {
      const campos = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ mensaje: campos.join('. ') });
    }
    res.status(500).json({ mensaje: 'Error al actualizar el cliente. Intentá de nuevo.' });
  }
};

// DELETE /api/clientes/:id — Soft delete
const deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }
    res.json({ mensaje: 'Cliente eliminado correctamente', cliente });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el cliente', error: error.message });
  }
};

// PUT /api/clientes/:id/restore — Restaurar cliente borrado
const restoreCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      { deletedAt: null },
      { new: true }
    );
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al restaurar el cliente', error: error.message });
  }
};

module.exports = {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  restoreCliente
};
