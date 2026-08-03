const express = require('express');
const router = express.Router();
const {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente
} = require('../controllers/clienteController');
const ConsultaLog = require('../models/ConsultaLog');

router.get('/', getClientes);
router.get('/:id', getClienteById);
router.post('/', createCliente);
router.put('/:id', updateCliente);
router.delete('/:id', deleteCliente);

// GET /api/clientes/:id/logs — Historial de consultas de un cliente
router.get('/:id/logs', async (req, res) => {
  try {
    const logs = await ConsultaLog.find({ clienteId: req.params.id })
      .sort({ fecha: -1 })
      .limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener logs', error: error.message });
  }
});

module.exports = router;
