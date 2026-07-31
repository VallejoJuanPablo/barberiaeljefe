const express = require('express');
const router = express.Router();
const {
  getMembresias,
  getMembresiaById,
  createMembresia,
  updateMembresia,
  deleteMembresia
} = require('../controllers/membresiaController');

router.get('/', getMembresias);
router.get('/:id', getMembresiaById);
router.post('/', createMembresia);
router.put('/:id', updateMembresia);
router.delete('/:id', deleteMembresia);

module.exports = router;
