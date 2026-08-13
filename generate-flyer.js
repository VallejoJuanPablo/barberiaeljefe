const sharp = require('sharp');
const QRCode = require('qrcode');
const path = require('path');

// === Config ===
const URL = 'https://eljefenegocios.com.ar/';
const OUTPUT = path.join(__dirname, 'img', 'flyer_eljefe.jpg');

// A4 a 300 DPI
const DPI = 300;
const PX = DPI / 2.54;
const W = Math.round(21 * PX);   // 2480
const H = Math.round(21 * PX);   // 2480 (cuadrado)

// Colores
const BG = '#0c0c0c';
const GOLD = '#c9a44c';
const GOLD_DIM = 'rgba(201,164,76,0.3)';
const WHITE = '#ffffff';
const GRAY = '#888888';

async function generateFlyer() {
  console.log(`Generando flyer ${W}x${H}px...`);

  // 1. Generar QR dorado sobre fondo transparente
  const qrSize = 680;
  const qrBuffer = await QRCode.toBuffer(URL, {
    width: qrSize,
    margin: 1,
    color: { dark: GOLD, light: '#00000000' },
    errorCorrectionLevel: 'H',
  });

  // 2. Logo
  const logo = await sharp(path.join(__dirname, 'panel', 'public', 'logo.png'))
    .resize(500, null, { fit: 'inside' })
    .toBuffer();
  const logoMeta = await sharp(logo).metadata();

  // 3. Tarjeta de ejemplo (frente)
  const cardW = 900;
  const card = await sharp(path.join(__dirname, 'img', 'frente.jpg'))
    .resize(cardW, null, { fit: 'inside' })
    .toBuffer();
  const cardMeta = await sharp(card).metadata();

  // 4. Construir SVG con textos
  const centerX = Math.round(W / 2);

  const svg = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800');
      </style>
      <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="10%" stop-color="transparent"/>
        <stop offset="50%" stop-color="${GOLD}"/>
        <stop offset="90%" stop-color="transparent"/>
      </linearGradient>
    </defs>

    <!-- Línea dorada superior -->
    <rect x="0" y="0" width="${W}" height="3" fill="url(#goldLine)" opacity="0.6"/>

    <!-- Título principal -->
    <text x="${centerX}" y="720" text-anchor="middle"
      font-family="'Playfair Display', Georgia, serif" font-weight="800"
      font-size="110" fill="${WHITE}">COMUNIDAD</text>
    <text x="${centerX}" y="870" text-anchor="middle"
      font-family="'Playfair Display', Georgia, serif" font-weight="800"
      font-size="140" fill="${GOLD}">EL JEFE</text>

    <!-- Línea separadora -->
    <rect x="${centerX - 150}" y="930" width="300" height="2" fill="url(#goldLine)" opacity="0.5"/>

    <!-- Línea separadora antes del QR -->
    <rect x="${centerX - 150}" y="1000" width="300" height="2" fill="url(#goldLine)" opacity="0.5"/>

    <!-- Texto QR -->
    <text x="${centerX}" y="1100" text-anchor="middle"
      font-family="Arial, sans-serif" font-weight="400"
      font-size="32" fill="${GOLD}" letter-spacing="6">ESCANEÁ Y CONOCÉ MÁS</text>

    <!-- Borde decorativo QR -->
    <rect x="${centerX - 370}" y="1130" width="740" height="740" rx="24"
      fill="none" stroke="${GOLD}" stroke-width="2" opacity="0.2"/>


    <!-- Footer -->
    <text x="${centerX}" y="2350" text-anchor="middle"
      font-family="Arial, sans-serif" font-size="24" fill="${GRAY}" opacity="0.3"
      letter-spacing="10">BARBERÍA EL JEFE</text>

    <!-- Línea dorada inferior -->
    <rect x="0" y="${H - 3}" width="${W}" height="3" fill="url(#goldLine)" opacity="0.6"/>
  </svg>`;

  // 5. Componer imagen final
  const svgBuffer = Buffer.from(svg);

  const logoX = Math.round(centerX - logoMeta.width / 2);
  const cardX = Math.round(centerX - cardMeta.width / 2);
  const qrX = Math.round(centerX - qrSize / 2);

  await sharp({
    create: {
      width: W,
      height: H,
      channels: 3,
      background: BG,
    },
  })
    .composite([
      // SVG con todos los textos
      { input: svgBuffer, top: 0, left: 0 },
      // Logo
      { input: logo, top: 140, left: logoX },
      // QR
      { input: qrBuffer, top: 1200, left: qrX },
    ])
    .jpeg({ quality: 95 })
    .toFile(OUTPUT);

  console.log(`Flyer generado: ${OUTPUT}`);
}

generateFlyer().catch(console.error);
