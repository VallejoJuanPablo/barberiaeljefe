const sharp = require('sharp');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://eljefenegocios.com.ar/consulta_membresia?codigo=';
const INPUT = path.join(__dirname, '../assets/frente.png');
const CACHE_DIR = path.join(__dirname, '../../uploads/tarjetas');

// Mismos parámetros que generate-cards.js (fuente: frente.png 2462x1728)
const SCALE = 0.5;
const OUT_W = Math.round(2462 * SCALE); // 1231
const OUT_H = Math.round(1728 * SCALE); // 864

// Crear carpeta de cache al arrancar
fs.mkdirSync(CACHE_DIR, { recursive: true });

async function generarTarjeta(codigo) {
  const cachePath = path.join(CACHE_DIR, `frente_${codigo}.jpg`);

  // Si ya existe en cache, devolver el archivo
  if (fs.existsSync(cachePath)) {
    return cachePath;
  }

  const qrSize = Math.round(640 * SCALE);
  const fontSize = Math.round(36 * SCALE);

  // 1. Generar QR dorado sobre fondo transparente
  const qrBuffer = await QRCode.toBuffer(BASE_URL + codigo, {
    width: qrSize,
    margin: 2,
    color: { dark: '#D4BD6E', light: '#00000000' },
    errorCorrectionLevel: 'H',
  });

  // 2. Texto con el código
  const textSvg = Buffer.from(
    `<svg width="${qrSize}" height="30">
      <text x="50%" y="20" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="${fontSize}"
        fill="#D4BD6E" letter-spacing="2">${codigo}</text>
    </svg>`
  );

  // 3. Componer sobre la imagen base
  const leftOffset = Math.round(1790 * SCALE - qrSize / 2);
  const topOffset = Math.round(OUT_H / 2 - qrSize / 2);
  const textTop = topOffset + qrSize + 5;

  await sharp(INPUT)
    .resize(OUT_W, OUT_H)
    .composite([
      { input: qrBuffer, left: leftOffset, top: topOffset },
      { input: textSvg, left: leftOffset, top: textTop },
    ])
    .jpeg({ quality: 82 })
    .toFile(cachePath);

  return cachePath;
}

module.exports = { generarTarjeta };
