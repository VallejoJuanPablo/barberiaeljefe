#!/bin/bash
# ============================================
# Restaurar backup desde VPS2
# Uso: ./restore-from-vps2.sh [fecha]
# Ej:  ./restore-from-vps2.sh 2026-09-03_03-00
#      ./restore-from-vps2.sh latest
# ============================================

# ---- CONFIGURACIÓN (mismos valores que backup) ----
MONGO_CONTAINER="mongo-barberia"
DB_NAME="barberiaeljefe"
VPS2_USER="root"
VPS2_HOST="IP_DEL_VPS2"
VPS2_PATH="/backups/barberia"
SSH_KEY="~/.ssh/id_rsa"
# ----------------------------------------------------

TARGET=${1:-"latest"}

if [ "$TARGET" == "latest" ]; then
  echo "Buscando último backup en VPS2..."
  BACKUP_FILE=$(ssh -i "$SSH_KEY" "${VPS2_USER}@${VPS2_HOST}" \
    "ls -t ${VPS2_PATH}/bej-backup-*.gz | head -1")
else
  BACKUP_FILE="${VPS2_PATH}/bej-backup-${TARGET}.gz"
fi

if [ -z "$BACKUP_FILE" ]; then
  echo "ERROR: No se encontró backup"
  exit 1
fi

echo "Descargando: $(basename $BACKUP_FILE)..."
scp -i "$SSH_KEY" "${VPS2_USER}@${VPS2_HOST}:${BACKUP_FILE}" /tmp/restore.gz

echo "Restaurando en MongoDB..."
docker exec -i "$MONGO_CONTAINER" mongorestore \
  --db "$DB_NAME" \
  --archive --gzip --drop < /tmp/restore.gz

rm -f /tmp/restore.gz
echo "Restauración completada."
