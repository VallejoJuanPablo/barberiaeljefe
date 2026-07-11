const express = require('express');
const router = express.Router();
const { checkMembresia } = require('../controllers/publicoController');

// GET /api/publico/membresia?codigo=BEJ-0001
router.get('/membresia', checkMembresia);

module.exports = router;
