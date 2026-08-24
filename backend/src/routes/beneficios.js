const express = require('express');
const router = express.Router();
const {
  getBeneficios,
  getBeneficioById,
  createBeneficio,
  updateBeneficio,
  deleteBeneficio
} = require('../controllers/beneficioController');

router.get('/', getBeneficios);
router.get('/:id', getBeneficioById);
router.post('/', createBeneficio);
router.put('/:id', updateBeneficio);
router.delete('/:id', deleteBeneficio);

module.exports = router;
