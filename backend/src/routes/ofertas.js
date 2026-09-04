const express = require('express');
const router = express.Router();
const {
  getOfertas,
  getOfertaById,
  createOferta,
  updateOferta,
  deleteOferta
} = require('../controllers/ofertaController');

router.get('/', getOfertas);
router.get('/:id', getOfertaById);
router.post('/', createOferta);
router.put('/:id', updateOferta);
router.delete('/:id', deleteOferta);

module.exports = router;
