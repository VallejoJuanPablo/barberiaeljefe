const Cliente = require('../models/Cliente');

/**
 * Desactiva membresías cuya fechaFin ya pasó.
 * Se ejecuta una vez al iniciar el servidor y luego cada 24 horas.
 */
async function desactivarMembresiasVencidas() {
  try {
    const ahora = new Date();
    const resultado = await Cliente.updateMany(
      {
        'membresia.activa': true,
        'membresia.fechaFin': { $lt: ahora }
      },
      { $set: { 'membresia.activa': false } }
    );

    if (resultado.modifiedCount > 0) {
      console.log(`[Cron] ${resultado.modifiedCount} membresía(s) desactivada(s) por vencimiento`);
    }
  } catch (error) {
    console.error('[Cron] Error al desactivar membresías:', error.message);
  }
}

function iniciarCronMembresias() {
  // Ejecutar al iniciar
  desactivarMembresiasVencidas();

  // Calcular milisegundos hasta la próxima medianoche (hora Argentina UTC-3)
  const ahora = new Date();
  const proximaMedianoche = new Date(ahora);
  proximaMedianoche.setHours(24, 0, 0, 0);
  const msHastaMedianoche = proximaMedianoche.getTime() - ahora.getTime();

  // Primera ejecución a medianoche, después cada 24hs
  setTimeout(() => {
    desactivarMembresiasVencidas();
    setInterval(desactivarMembresiasVencidas, 24 * 60 * 60 * 1000);
  }, msHastaMedianoche);

  console.log(`[Cron] Verificación de membresías programada — próxima ejecución en ${Math.round(msHastaMedianoche / 60000)} minutos`);
}

module.exports = { iniciarCronMembresias, desactivarMembresiasVencidas };
