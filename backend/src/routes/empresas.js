const express = require('express');
const router = express.Router();
const {
  getEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  registrarPago,
  suspenderEmpresa,
  getEmpleados
} = require('../controllers/empresaController');

router.get('/', getEmpresas);
router.get('/:id', getEmpresaById);
router.post('/', createEmpresa);
router.put('/:id', updateEmpresa);
router.delete('/:id', deleteEmpresa);
router.put('/:id/pago', registrarPago);
router.put('/:id/suspender', suspenderEmpresa);
router.get('/:id/empleados', getEmpleados);

module.exports = router;
