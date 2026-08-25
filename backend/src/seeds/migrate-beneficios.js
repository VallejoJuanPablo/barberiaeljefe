/**
 * Migración: Beneficios embebidos → entidad independiente
 *
 * Qué hace:
 * 1. Lee todas las membresías con beneficios embebidos (formato viejo: [{categoria, icono, items[]}])
 * 2. Extrae beneficios únicos y los crea en la colección Beneficio (con deduplicación)
 * 3. Reemplaza los subdocumentos por ObjectIds en cada membresía
 *
 * Seguro de ejecutar múltiples veces: si detecta que ya hay beneficios como ObjectIds, los ignora.
 *
 * Uso: node src/seeds/migrate-beneficios.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Beneficio = require('../models/Beneficio');
const Membresia = require('../models/Membresia');

async function migrate() {
  await connectDB();

  // 1. Leer todas las membresías en crudo (sin schema validation)
  const db = mongoose.connection.db;
  const membresiasRaw = await db.collection('membresias').find({}).toArray();

  console.log(`\n=== Migración de Beneficios ===`);
  console.log(`Membresías encontradas: ${membresiasRaw.length}`);

  // 2. Detectar si ya están migradas
  let necesitaMigracion = false;
  for (const m of membresiasRaw) {
    if (m.beneficios?.length > 0 && typeof m.beneficios[0] === 'object' && m.beneficios[0].categoria) {
      necesitaMigracion = true;
      break;
    }
  }

  if (!necesitaMigracion) {
    console.log('\n✓ Las membresías ya están migradas (beneficios son ObjectIds). Nada que hacer.');
    process.exit(0);
  }

  // 3. Extraer beneficios únicos de todas las membresías
  const beneficioMap = new Map(); // clave: "nombre|categoria" → {nombre, categoria, icono}

  for (const m of membresiasRaw) {
    if (!m.beneficios || !Array.isArray(m.beneficios)) continue;
    for (const ben of m.beneficios) {
      if (!ben.categoria || !ben.items) continue; // no es formato viejo
      for (const item of ben.items) {
        const key = `${item.trim().toLowerCase()}|${ben.categoria.trim().toLowerCase()}`;
        if (!beneficioMap.has(key)) {
          beneficioMap.set(key, {
            nombre: item.trim(),
            categoria: ben.categoria.trim(),
            icono: ben.icono || '',
            codigo: '',
            activo: true
          });
        }
      }
    }
  }

  console.log(`Beneficios únicos encontrados: ${beneficioMap.size}`);

  // 4. Crear beneficios en la colección (o encontrar existentes)
  const beneficioIdMap = new Map(); // "nombre|categoria" → ObjectId

  for (const [key, data] of beneficioMap) {
    // Buscar si ya existe
    let existente = await Beneficio.findOne({
      nombre: { $regex: new RegExp(`^${escapeRegex(data.nombre)}$`, 'i') },
      categoria: { $regex: new RegExp(`^${escapeRegex(data.categoria)}$`, 'i') }
    });

    if (existente) {
      console.log(`  Ya existe: "${data.nombre}" (${data.categoria})`);
      beneficioIdMap.set(key, existente._id);
    } else {
      const nuevo = await Beneficio.create(data);
      console.log(`  Creado: "${data.nombre}" (${data.categoria})`);
      beneficioIdMap.set(key, nuevo._id);
    }
  }

  // 5. Actualizar cada membresía: reemplazar subdocumentos por ObjectIds
  let actualizadas = 0;
  for (const m of membresiasRaw) {
    if (!m.beneficios || !Array.isArray(m.beneficios)) continue;

    // Verificar que tiene formato viejo
    if (m.beneficios.length > 0 && typeof m.beneficios[0] !== 'object') continue;
    if (m.beneficios.length > 0 && !m.beneficios[0].categoria) continue;

    const ids = [];
    for (const ben of m.beneficios) {
      if (!ben.categoria || !ben.items) continue;
      for (const item of ben.items) {
        const key = `${item.trim().toLowerCase()}|${ben.categoria.trim().toLowerCase()}`;
        const id = beneficioIdMap.get(key);
        if (id && !ids.some(existingId => existingId.equals(id))) {
          ids.push(id);
        }
      }
    }

    // Actualizar directamente en la colección (bypass schema)
    await db.collection('membresias').updateOne(
      { _id: m._id },
      { $set: { beneficios: ids } }
    );
    console.log(`  Membresía "${m.nombre}": ${m.beneficios.length} categorías → ${ids.length} beneficios (refs)`);
    actualizadas++;
  }

  console.log(`\n=== Resultado ===`);
  console.log(`Beneficios en colección: ${await Beneficio.countDocuments()}`);
  console.log(`Membresías actualizadas: ${actualizadas}`);
  console.log(`\n✓ Migración completada exitosamente.\n`);

  process.exit(0);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

migrate().catch(err => {
  console.error('\n✗ Error en migración:', err);
  process.exit(1);
});
