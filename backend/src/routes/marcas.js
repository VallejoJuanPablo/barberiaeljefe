const express = require('express');
const router = express.Router();
const {
  getMarcas,
  getMarcaById,
  createMarca,
  updateMarca,
  deleteMarca
} = require('../controllers/marcaController');

router.get('/', getMarcas);
router.get('/:id', getMarcaById);
router.post('/', createMarca);
router.put('/:id', updateMarca);
router.delete('/:id', deleteMarca);

module.exports = router;
