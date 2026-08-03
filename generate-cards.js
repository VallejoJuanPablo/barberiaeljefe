const sharp = require('sharp');
const QRCode = require('qrcode');

const BASE_URL = 'https://eljefenegocios.com.ar/consulta_membresia?codigo=';
const CODES = Array.from({ length: 100 }, (_, i) => `BEJ-${String(i + 1).padStart(4, '0')}`);
const INPUT = 'img/frente.png';

async function generateCard(codigo) {
  const qrSize = 640;

  // 1. Generate QR: gold modules on transparent background
  const qrBuffer = await QRCode.toBuffer(BASE_URL + codigo, {
    width: qrSize,
    margin: 2,
    color: { dark: '#D4BD6E', light: '#00000000' },
    errorCorrectionLevel: 'H',
  });

  // 2. Create text label with the code
  const fontSize = 36;
  const textSvg = Buffer.from(
    `<svg width="${qrSize}" height="60">
      <text x="50%" y="40" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="${fontSize}"
        fill="#D4BD6E" letter-spacing="3">${codigo}</text>
    </svg>`
  );

  // 3. Composite onto the base image
  const leftOffset = Math.round(1790 - qrSize / 2);
  const topOffset = Math.round(1728 / 2 - qrSize / 2);
  const textTop = topOffset + qrSize + 10;

  const output = `img/frente_${codigo}.png`;
  await sharp(INPUT)
    .composite([
      { input: qrBuffer, left: leftOffset, top: topOffset },
      { input: textSvg, left: leftOffset, top: textTop },
    ])
    .toFile(output);

  console.log(`OK: ${output}`);
}

(async () => {
  for (const code of CODES) {
    await generateCard(code);
  }
})();
