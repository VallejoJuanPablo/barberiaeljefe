const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Asegurar que el directorio de uploads exista
const uploadsDir = path.join(__dirname, '../../uploads/marcas');
fs.mkdirSync(uploadsDir, { recursive: true });
const {
  getMarcas,
  getMarcaById,
  createMarca,
  updateMarca,
  deleteMarca
} = require('../controllers/marcaController');

// Configurar multer para logos de marcas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype.replace('image/', '').replace('+xml', ''));
    cb(null, ext || mime);
  }
});

router.get('/', getMarcas);
router.get('/:id', getMarcaById);
router.post('/', upload.single('logo'), createMarca);
router.put('/:id', upload.single('logo'), updateMarca);
router.delete('/:id', deleteMarca);

module.exports = router;
