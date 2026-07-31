require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Cliente = require('../models/Cliente');
const Usuario = require('../models/Usuario');
const Membresia = require('../models/Membresia');

const adminUser = {
  email: 'admin@eljefenegocios.com.ar',
  password: 'admin123',
  nombre: 'Administrador'
};

const clientes = [
  {
    codigo: 'BEJ-0001',
    nombre: 'Carlos Gómez',
    telefono: '3794112233',
    email: 'carlos.gomez@email.com',
    membresia: { activa: true, tipo: 'Jefe Individual', fechaInicio: new Date('2026-07-01'), fechaFin: new Date('2027-07-01') }
  },
  {
    codigo: 'BEJ-0002',
    nombre: 'Martín López',
    telefono: '3794445566',
    email: 'martin.lopez@email.com',
    membresia: { activa: false, tipo: 'Jefe Familiar', fechaInicio: new Date('2026-01-01'), fechaFin: new Date('2026-06-30') }
  }
];

const beneficiosBase = [
  {
    categoria: 'Indumentaria', icono: '👕',
    items: ['10% OFF en URBINA Concept (indumentaria masculina)']
  },
  {
    categoria: 'Gastronomía', icono: '🍔',
    items: [
      '10% OFF + beneficios exclusivos en Tomate, ¿Qué te pasa? (casa de comidas rápidas)',
      'Beneficios exclusivos en Grido 1000 Viviendas',
      '10% OFF en MEGADRINKS (Rafaela casi Tres de Abril)'
    ]
  },
  {
    categoria: 'Fitness & bienestar', icono: '🏋️',
    items: [
      '10% OFF en la cuota de Panter Gym',
      'Beneficios exclusivos en CAPPYGYM',
      '15% OFF en todos los servicios de Vitta Studio',
      '20% OFF en jornadas de depilación definitiva de Vitta Studio'
    ]
  }
];

const membresias = [
  {
    nombre: 'Jefe Ejecutivo',
    precio: 42000,
    incluye: ['4 cortes de pelo por mes', '10% OFF en productos de la barbería'],
    beneficios: [...beneficiosBase],
    descripcion: ''
  },
  {
    nombre: 'Jefe Full',
    precio: 40000,
    incluye: ['4 servicios de barba / perfilado por mes', '10% OFF en productos de la barbería'],
    beneficios: [
      ...beneficiosBase,
      { categoria: 'Servicios', icono: '🧼', items: ['10% OFF en Lavadero El Jefe'] }
    ],
    descripcion: 'Un plan pensado para quienes buscan presencia, estilo y beneficios reales todos los días.'
  },
  {
    nombre: 'Cut Clean',
    precio: 40000,
    incluye: ['2 cortes de pelo por mes', '1 lavado de auto sin cargo en Lavadero El Jefe'],
    beneficios: [...beneficiosBase],
    descripcion: 'La combinación perfecta para quienes quieren verse bien y mantener su vehículo impecable, con beneficios exclusivos que hacen rendir mucho más tu membresía.'
  },
  {
    nombre: 'Promo Moto',
    precio: 44000,
    incluye: ['3 cortes de pelo por mes', '1 lavado de moto sin cargo en Lavadero El Jefe'],
    beneficios: [...beneficiosBase],
    descripcion: ''
  },
  {
    nombre: 'Jefe Familiar',
    precio: 80000,
    incluye: [
      '2 cortes de pelo + barba por mes',
      '2 cortes de niño por mes',
      '10% OFF en productos de la barbería',
      '1 lavado de camioneta sin cargo en Lavadero El Jefe'
    ],
    beneficios: [...beneficiosBase],
    descripcion: 'Pensado para toda la familia. Combina cortes para grandes y chicos, beneficios exclusivos, descuentos en comercios aliados y un lavado de camioneta sin cargo cada mes para disfrutar una experiencia completa.'
  },
  {
    nombre: 'Madre e Hijo',
    precio: 36000,
    incluye: ['2 cortes de niño por mes', '1 hidratación sin cargo', '10% OFF en productos de la barbería'],
    beneficios: [
      { categoria: 'Indumentaria', icono: '👕', items: ['10% OFF en URBINA Concept (indumentaria masculina)'] },
      { categoria: 'Servicios', icono: '🧼', items: ['10% OFF en Lavadero El Jefe'] },
      {
        categoria: 'Gastronomía', icono: '🍔',
        items: [
          '10% OFF + beneficios exclusivos en Tomate, ¿Qué te pasa? (casa de comidas rápidas)',
          'Beneficios exclusivos en Grido 1000 Viviendas',
          '10% OFF en MEGADRINKS (Rafaela casi Tres de Abril)'
        ]
      },
      {
        categoria: 'Fitness & bienestar', icono: '🏋️',
        items: [
          '10% OFF en la cuota de Panter Gym',
          'Beneficios exclusivos en CAPPYGYM',
          '15% OFF en todos los servicios de Vitta Studio',
          '20% OFF en jornadas de depilación definitiva de Vitta Studio'
        ]
      }
    ],
    descripcion: 'Un plan pensado para acompañar el cuidado de los más chicos con beneficios para toda la familia. Incluye cortes, una hidratación de regalo y descuentos exclusivos en comercios y servicios aliados para disfrutar todos los meses.'
  },
  {
    nombre: 'Plan x2 + Auto',
    precio: 58000,
    incluye: [
      '1 corte de pelo por mes',
      '1 corte de niño por mes',
      '2 lavados de auto sin cargo en Lavadero El Jefe',
      '10% OFF en productos de la barbería'
    ],
    beneficios: [...beneficiosBase],
    descripcion: ''
  },
  {
    nombre: 'Jefe Individual',
    precio: 50000,
    incluye: [
      '1 corte de pelo + barba por mes',
      '1 limpieza facial',
      '1 lavado de auto sin cargo en Lavadero El Jefe',
      '10% OFF en productos de la barbería'
    ],
    beneficios: [...beneficiosBase],
    descripcion: 'Diseñado para quienes buscan una experiencia premium. Combina barbería, cuidado facial, un lavado de auto sin cargo y una amplia red de beneficios exclusivos para disfrutar durante todo el mes.'
  }
];

async function seed() {
  await connectDB();

  // Usuario admin
  const userCount = await Usuario.countDocuments();
  if (userCount === 0) {
    await Usuario.create(adminUser);
    console.log(`Usuario admin creado: ${adminUser.email} / ${adminUser.password}`);
  } else {
    console.log(`Ya existen ${userCount} usuarios. Omitido.`);
  }

  // Membresías
  const membCount = await Membresia.countDocuments();
  if (membCount === 0) {
    await Membresia.insertMany(membresias);
    console.log(`${membresias.length} membresías creadas`);
  } else {
    console.log(`Ya existen ${membCount} membresías. Omitido.`);
  }

  // Clientes
  const clienteCount = await Cliente.countDocuments();
  if (clienteCount === 0) {
    await Cliente.insertMany(clientes);
    console.log(`${clientes.length} clientes creados`);
  } else {
    console.log(`Ya existen ${clienteCount} clientes. Omitido.`);
  }

  console.log('Seed completado');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error en seed:', err);
  process.exit(1);
});
