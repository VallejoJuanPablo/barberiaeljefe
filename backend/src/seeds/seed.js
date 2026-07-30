require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Cliente = require('../models/Cliente');
const Usuario = require('../models/Usuario');

const clientes = [
  {
    codigo: 'BEJ-0001',
    nombre: 'Carlos Gómez',
    telefono: '3794112233',
    email: 'carlos.gomez@email.com',
    membresia: {
      activa: true,
      tipo: 'Gold',
      fechaInicio: new Date('2026-07-01'),
      fechaFin: new Date('2027-07-01')
    }
  },
  {
    codigo: 'BEJ-0002',
    nombre: 'Martín López',
    telefono: '3794445566',
    email: 'martin.lopez@email.com',
    membresia: {
      activa: false,
      tipo: 'Básica',
      fechaInicio: new Date('2026-01-01'),
      fechaFin: new Date('2026-06-30')
    }
  }
];

const adminUser = {
  email: 'admin@eljefenegocios.com.ar',
  password: 'admin123',
  nombre: 'Administrador'
};

async function seed() {
  await connectDB();

  // Seed usuario admin
  const userCount = await Usuario.countDocuments();
  if (userCount === 0) {
    await Usuario.create(adminUser);
    console.log(`Usuario admin creado: ${adminUser.email} / ${adminUser.password}`);
  } else {
    console.log(`Ya existen ${userCount} usuarios. Seed de usuarios omitido.`);
  }

  // Seed clientes
  const clienteCount = await Cliente.countDocuments();
  if (clienteCount === 0) {
    await Cliente.insertMany(clientes);
    console.log(`${clientes.length} clientes creados`);
  } else {
    console.log(`Ya existen ${clienteCount} clientes. Seed de clientes omitido.`);
  }

  console.log('Seed completado');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error en seed:', err);
  process.exit(1);
});
