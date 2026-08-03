const sharp = require('sharp');
const QRCode = require('qrcode');

const BASE_URL = 'https://eljefenegocios.com.ar/consulta_membresia?codigo=';
const CODES = Array.from({ length: 100 }, (_, i) => `BEJ-${String(i + 1).padStart(4, '0')}`);
const INPUT = 'img/frente.png';

// Original: 2462x1728. Scale to ~50% → 1231x864
const SCALE = 0.5;
const OUT_W = Math.round(2462 * SCALE);
const OUT_H = Math.round(1728 * SCALE);

async function generateCard(codigo) {
  const qrSize = Math.round(640 * SCALE);
  const fontSize = Math.round(36 * SCALE);

  // 1. Generate QR: gold modules on transparent background
  const qrBuffer = await QRCode.toBuffer(BASE_URL + codigo, {
    width: qrSize,
    margin: 2,
    color: { dark: '#D4BD6E', light: '#00000000' },
    errorCorrectionLevel: 'H',
  });

  // 2. Create text label with the code
  const textSvg = Buffer.from(
    `<svg width="${qrSize}" height="30">
      <text x="50%" y="20" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="${fontSize}"
        fill="#D4BD6E" letter-spacing="2">${codigo}</text>
    </svg>`
  );

  // 3. Composite onto resized base image
  const leftOffset = Math.round(1790 * SCALE - qrSize / 2);
  const topOffset = Math.round(OUT_H / 2 - qrSize / 2);
  const textTop = topOffset + qrSize + 5;

  const output = `img/frente_${codigo}.jpg`;
  await sharp(INPUT)
    .resize(OUT_W, OUT_H)
    .composite([
      { input: qrBuffer, left: leftOffset, top: topOffset },
      { input: textSvg, left: leftOffset, top: textTop },
    ])
    .jpeg({ quality: 82 })
    .toFile(output);

  console.log(`OK: ${output}`);
}

(async () => {
  for (const code of CODES) {
    await generateCard(code);
  }
})();
