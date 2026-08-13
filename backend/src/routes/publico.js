const express = require('express');
const router = express.Router();
const { checkMembresia, getPlanes } = require('../controllers/publicoController');

// GET /api/publico/membresia?codigo=BEJ-0001
router.get('/membresia', checkMembresia);

// GET /api/publico/planes — Lista planes activos
router.get('/planes', getPlanes);

module.exports = router;
