/**
 * Resetear contraseña del admin
 * Uso: node src/scripts/reset-password.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const NUEVA_PASSWORD = 'Membresias@2209';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado a MongoDB');

  const Usuario = require('../models/Usuario');
  const admin = await Usuario.findOne({});

  if (!admin) {
    console.error('No se encontró ningún usuario');
    process.exit(1);
  }

  admin.password = NUEVA_PASSWORD;
  await admin.save(); // el pre-save hashea automáticamente

  console.log(`Contraseña actualizada para: ${admin.email}`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
