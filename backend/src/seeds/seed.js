require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Cliente = require('../models/Cliente');

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

const membresias = ['Básica', 'Premium', 'Gold', 'VIP'];

async function seed() {
  await connectDB();

  const count = await Cliente.countDocuments();
  if (count > 0) {
    console.log(`Ya existen ${count} clientes. Seed cancelado.`);
    process.exit(0);
  }

  await Cliente.insertMany(clientes);
  console.log(`Seed completado: ${clientes.length} clientes creados`);
  console.log(`Tipos de membresía disponibles: ${membresias.join(', ')}`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Error en seed:', err);
  process.exit(1);
});
