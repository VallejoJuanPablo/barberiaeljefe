/**
 * Resetear contraseña del admin
 * Uso: npm run reset-password (desde /backend)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Usuario = require('../models/Usuario');

const NUEVA_PASSWORD = 'Membresias@2209';

async function main() {
  await connectDB();

  const admin = await Usuario.findOne({});

  if (!admin) {
    console.error('No se encontró ningún usuario');
    process.exit(1);
  }

  admin.password = NUEVA_PASSWORD;
  await admin.save();

  console.log(`Contraseña actualizada para: ${admin.email}`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
