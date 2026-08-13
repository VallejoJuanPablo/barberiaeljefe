const sharp = require('sharp');
const path = require('path');

// === Config ===
const DPI = 300;
const PX = DPI / 2.54; // px per cm

// Tarjeta 9×5 cm
const CARD_W = Math.floor(9 * PX);   // 1062
const CARD_H = Math.floor(5 * PX);   // 590

// Hoja A3+ 32×47 cm
const SHEET_W = Math.round(32 * PX); // 3780
const SHEET_H = Math.round(47 * PX); // 5551

// Margen 1 cm
const MARGIN = Math.round(1 * PX);   // 118

// Area imprimible
const PRINT_W = SHEET_W - 2 * MARGIN;
const PRINT_H = SHEET_H - 2 * MARGIN;

// Grilla
const COLS = Math.floor(PRINT_W / CARD_W);
const ROWS = Math.floor(PRINT_H / CARD_H);
const PER_SHEET = COLS * ROWS;

// Centrar grilla en el area imprimible
const OFF_X = MARGIN + Math.floor((PRINT_W - COLS * CARD_W) / 2);
const OFF_Y = MARGIN + Math.floor((PRINT_H - ROWS * CARD_H) / 2);

const TOTAL = 100;
const SHEETS = Math.ceil(TOTAL / PER_SHEET);

// Crop del margen negro de cada tarjeta individual
const CROP_LEFT = 105;
const CROP_TOP = 109;
const CROP_W = 1022;
const CROP_H = 645;

const BG = { r: 255, g: 255, b: 255 };

async function generateFront(sheetIdx, startCard, count) {
  const composites = [];

  for (let i = 0; i < count; i++) {
    const code = `BEJ-${String(startCard + i).padStart(4, '0')}`;
    const col = i % COLS;
    const row = Math.floor(i / COLS);

    const buf = await sharp(path.join('img', `frente_${code}.jpg`))
      .extract({ left: CROP_LEFT, top: CROP_TOP, width: CROP_W, height: CROP_H })
      .resize(CARD_W, CARD_H, { fit: 'fill' })
      .toBuffer();

    composites.push({
      input: buf,
      left: OFF_X + col * CARD_W,
      top: OFF_Y + row * CARD_H,
    });
  }

  const file = `img/a3_frente_${sheetIdx}.jpg`;
  await sharp({ create: { width: SHEET_W, height: SHEET_H, channels: 3, background: BG } })
    .composite(composites)
    .jpeg({ quality: 95 })
    .toFile(file);

  console.log(`  ${file} (${count} tarjetas)`);
}

async function generateBack(sheetIdx, count) {
  const backBuf = await sharp('img/atras.png')
    .resize(CARD_W, CARD_H, { fit: 'fill' })
    .jpeg({ quality: 95 })
    .toBuffer();

  const composites = [];

  for (let i = 0; i < count; i++) {
    // Espejado horizontal para doble faz (flip en borde largo)
    const col = (COLS - 1) - (i % COLS);
    const row = Math.floor(i / COLS);

    composites.push({
      input: backBuf,
      left: OFF_X + col * CARD_W,
      top: OFF_Y + row * CARD_H,
    });
  }

  const file = `img/a3_atras_${sheetIdx}.jpg`;
  await sharp({ create: { width: SHEET_W, height: SHEET_H, channels: 3, background: BG } })
    .composite(composites)
    .jpeg({ quality: 95 })
    .toFile(file);

  console.log(`  ${file} (${count} tarjetas, espejado)`);
}

(async () => {
  console.log('=== Hojas A3+ para impresion ===');
  console.log(`Tarjeta: 9x5 cm  (${CARD_W}x${CARD_H} px)`);
  console.log(`Hoja:    32x47 cm (${SHEET_W}x${SHEET_H} px)`);
  console.log(`Margen:  1 cm     (${MARGIN} px)`);
  console.log(`Grilla:  ${COLS} col x ${ROWS} filas = ${PER_SHEET} tarjetas/hoja`);
  console.log(`Total:   ${TOTAL} tarjetas -> ${SHEETS} hojas\n`);

  for (let s = 0; s < SHEETS; s++) {
    const start = s * PER_SHEET + 1;
    const count = Math.min(PER_SHEET, TOTAL - s * PER_SHEET);
    console.log(`Hoja ${s + 1}: BEJ-${String(start).padStart(4, '0')} a BEJ-${String(start + count - 1).padStart(4, '0')}`);
    await generateFront(s + 1, start, count);
    await generateBack(s + 1, count);
  }

  console.log('\nListo para imprimir doble faz');
})();
