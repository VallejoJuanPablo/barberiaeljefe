#!/bin/bash
# ============================================
# Backup diario MongoDB — VPS1 → VPS2
# Barbería El Jefe
# ============================================

# ---- CONFIGURACIÓN (editar estos valores) ----
MONGO_CONTAINER="mongo-barberia"       # nombre del contenedor de MongoDB en VPS1
DB_NAME="barberiaeljefe"               # nombre de la base de datos
MONGO_USER="bej_admin"                 # usuario MongoDB
MONGO_PASS="323cb012cd1f084372ae75b05a8e363612a71880fff8ddbc21b900275f3144d3"
VPS2_USER="root"                       # usuario SSH del VPS2
VPS2_HOST="IP_DEL_VPS2"               # IP o dominio del VPS2
VPS2_PORT=5875                         # puerto SSH del VPS2
VPS2_PATH="/backups/barberia"          # ruta en VPS2 donde guardar
SSH_KEY="~/.ssh/id_rsa"               # clave SSH (sin passphrase para cron)
KEEP_DAYS=30                           # días de backups a conservar en VPS2
# -----------------------------------------------

DATE=$(date +%Y-%m-%d_%H-%M)
BACKUP_FILE="bej-backup-${DATE}.gz"
LOCAL_TMP="/tmp/${BACKUP_FILE}"
LOG="/var/log/bej-backup.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG"
}

log "=== Inicio backup ==="

# 1. Dump de MongoDB dentro del contenedor y comprimir
docker exec "$MONGO_CONTAINER" mongodump \
  --db "$DB_NAME" \
  --username "$MONGO_USER" --password "$MONGO_PASS" --authenticationDatabase admin \
  --archive --gzip 2>/dev/null > "$LOCAL_TMP"

if [ $? -ne 0 ]; then
  log "ERROR: mongodump falló"
  exit 1
fi

SIZE=$(du -h "$LOCAL_TMP" | cut -f1)
log "Dump OK: ${BACKUP_FILE} (${SIZE})"

# 2. Enviar al VPS2
scp -i "$SSH_KEY" -P "$VPS2_PORT" -o StrictHostKeyChecking=no \
  "$LOCAL_TMP" "${VPS2_USER}@${VPS2_HOST}:${VPS2_PATH}/${BACKUP_FILE}" 2>/dev/null

if [ $? -ne 0 ]; then
  log "ERROR: scp al VPS2 falló"
  exit 1
fi

log "Enviado a VPS2: ${VPS2_PATH}/${BACKUP_FILE}"

# 3. Limpiar backups viejos en VPS2 (más de $KEEP_DAYS días)
ssh -i "$SSH_KEY" -p "$VPS2_PORT" -o StrictHostKeyChecking=no \
  "${VPS2_USER}@${VPS2_HOST}" \
  "find ${VPS2_PATH} -name 'bej-backup-*.gz' -mtime +${KEEP_DAYS} -delete" 2>/dev/null

log "Limpieza de backups >$KEEP_DAYS días OK"

# 4. Limpiar archivo temporal local
rm -f "$LOCAL_TMP"

log "=== Backup completado ==="
