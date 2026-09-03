# Backup diario MongoDB — VPS1 → VPS2

## Setup (una sola vez)

### 1. En VPS1 — Configurar SSH sin passphrase hacia VPS2

```bash
# Generar clave si no existe
ssh-keygen -t ed25519 -f ~/.ssh/id_rsa -N ""

# Copiar clave pública al VPS2
ssh-copy-id -i ~/.ssh/id_rsa.pub root@IP_DEL_VPS2

# Probar que conecta sin contraseña
ssh -i ~/.ssh/id_rsa root@IP_DEL_VPS2 "echo OK"
```

### 2. En VPS2 — Crear carpeta de backups

```bash
mkdir -p /backups/barberia
```

### 3. En VPS1 — Editar configuración del script

```bash
nano /ruta/al/proyecto/backup/backup-to-vps2.sh
```

Cambiar estos valores:
- `MONGO_CONTAINER` → nombre real del contenedor (`docker ps | grep mongo`)
- `VPS2_HOST` → IP real del VPS2
- `VPS2_USER` → usuario SSH
- `SSH_KEY` → ruta a la clave SSH

### 4. En VPS1 — Dar permisos y programar cron

```bash
chmod +x backup/backup-to-vps2.sh
chmod +x backup/restore-from-vps2.sh

# Agregar cron a las 3AM todos los días
(crontab -l 2>/dev/null; echo "0 3 * * * /ruta/al/proyecto/backup/backup-to-vps2.sh") | crontab -
```

### 5. Probar

```bash
./backup/backup-to-vps2.sh
# Revisar log
cat /var/log/bej-backup.log
```

## Restaurar

```bash
# Último backup disponible
./backup/restore-from-vps2.sh latest

# Backup de fecha específica
./backup/restore-from-vps2.sh 2026-09-03_03-00
```

## Verificar que funciona

```bash
# Ver backups en VPS2
ssh root@IP_DEL_VPS2 "ls -lh /backups/barberia/"

# Ver log de ejecuciones
cat /var/log/bej-backup.log
```
