const sharp = require('sharp');
const path = require('path');

const COLS = 10;
const ROWS = 10;

// Frente: crop del margen negro
const CROP_LEFT = 105;
const CROP_TOP = 109;
const CROP_W = 1022;
const CROP_H = 645;

// Dorso: bounds de la tarjeta dentro de atras.png
const BACK_LEFT = 412;
const BACK_TOP = 210;
const BACK_W = 1897;
const BACK_H = 1160;

const TOTAL_W = COLS * CROP_W;
const TOTAL_H = ROWS * CROP_H;
const BG = { r: 0, g: 0, b: 0 };

async function generateFront() {
  const composites = [];

  for (let i = 0; i < 100; i++) {
    const code = `BEJ-${String(i + 1).padStart(4, '0')}`;
    const col = i % COLS;
    const row = Math.floor(i / COLS);

    const cropped = await sharp(path.join('img', `frente_${code}.jpg`))
      .extract({ left: CROP_LEFT, top: CROP_TOP, width: CROP_W, height: CROP_H })
      .toBuffer();

    composites.push({ input: cropped, left: col * CROP_W, top: row * CROP_H });
  }

  await sharp({ create: { width: TOTAL_W, height: TOTAL_H, channels: 3, background: BG } })
    .composite(composites)
    .jpeg({ quality: 90 })
    .toFile('img/tarjetas_frente.jpg');

  console.log(`OK: img/tarjetas_frente.jpg`);
}

async function generateBack() {
  // Resize al tamaño del frente
  const backCard = await sharp('img/atras.png')
    .resize(CROP_W, CROP_H, { fit: 'fill' })
    .jpeg({ quality: 90 })
    .toBuffer();

  const composites = [];

  for (let i = 0; i < 100; i++) {
    // Espejado horizontal para doble faz
    const col = (COLS - 1) - (i % COLS);
    const row = Math.floor(i / COLS);
    composites.push({ input: backCard, left: col * CROP_W, top: row * CROP_H });
  }

  await sharp({ create: { width: TOTAL_W, height: TOTAL_H, channels: 3, background: BG } })
    .composite(composites)
    .jpeg({ quality: 90 })
    .toFile('img/tarjetas_atras.jpg');

  console.log(`OK: img/tarjetas_atras.jpg`);
}

(async () => {
  await generateFront();
  await generateBack();
})();
