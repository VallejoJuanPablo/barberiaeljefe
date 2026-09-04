const express = require('express');
const router = express.Router();
const { checkMembresia, getPlanes, getMarcasPublicas, getBeneficiosRelampagoVigentes } = require('../controllers/publicoController');

// GET /api/publico/membresia?codigo=BEJ-0001
router.get('/membresia', checkMembresia);

// GET /api/publico/planes — Lista planes activos
router.get('/planes', getPlanes);

// GET /api/publico/marcas — Marcas activas
router.get('/marcas', getMarcasPublicas);

// GET /api/publico/beneficios-relampago — Beneficios relámpago vigentes
router.get('/beneficios-relampago', getBeneficiosRelampagoVigentes);

module.exports = router;
