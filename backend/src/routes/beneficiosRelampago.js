const express = require('express');
const router = express.Router();
const {
  getBeneficiosRelampago,
  getBeneficioRelampagoById,
  createBeneficioRelampago,
  updateBeneficioRelampago,
  deleteBeneficioRelampago
} = require('../controllers/beneficioRelampagoController');

router.get('/', getBeneficiosRelampago);
router.get('/:id', getBeneficioRelampagoById);
router.post('/', createBeneficioRelampago);
router.put('/:id', updateBeneficioRelampago);
router.delete('/:id', deleteBeneficioRelampago);

module.exports = router;
