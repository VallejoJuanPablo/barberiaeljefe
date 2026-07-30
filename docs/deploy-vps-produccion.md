# Guia de Deploy a Produccion — BarberiaElJefe (Docker + Multi-proyecto)

> VPS con infraestructura ya montada (Traefik + Portainer). Solo se documenta el deploy del proyecto.
>
> Stack: Docker Compose | Traefik (reverse proxy + SSL) | Node.js + Express + Mongoose | MongoDB 7 | Angular 19 SPA + Tailwind CSS 4 | Nginx

---

## Indice

1. [Arquitectura del proyecto](#1-arquitectura-del-proyecto)
2. [Pre-requisitos (infraestructura existente)](#2-pre-requisitos-infraestructura-existente)
3. [Estructura en el servidor](#3-estructura-en-el-servidor)
4. [Crear Dockerfile del backend](#4-crear-dockerfile-del-backend)
5. [Crear Dockerfile del frontend (multi-stage)](#5-crear-dockerfile-del-frontend-multi-stage)
6. [Crear config de Nginx interna](#6-crear-config-de-nginx-interna)
7. [Crear .env de produccion](#7-crear-env-de-produccion)
8. [Docker Compose del proyecto](#8-docker-compose-del-proyecto)
9. [Configurar DNS](#9-configurar-dns)
10. [Deploy](#10-deploy)
11. [Seed inicial (solo primera vez)](#11-seed-inicial-solo-primera-vez)
12. [Verificacion post-deploy](#12-verificacion-post-deploy)
13. [Mantenimiento y operaciones](#13-mantenimiento-y-operaciones)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Arquitectura del proyecto

```
Internet
    |
    v
[ Traefik :80/:443 ]  ─── SSL automatico (Let's Encrypt)
    |
    |── eljefenegocios.com.ar ──> [ bej-web ]   Nginx (Angular 19 SPA + proxy)
    |                               |
    |                          [ bej-api ]    Node.js (Express + Mongoose)
    |                               |
    |                          [ bej-db ]     MongoDB 7
    |
    v
[ Red Docker: proxy ]  ─── Red compartida con Traefik
```

| Componente | Tecnologia | Puerto interno |
|------------|-----------|---------------|
| **Frontend** | Angular 19 + Tailwind CSS 4 servido por Nginx | 80 |
| **Backend** | Node.js + Express 5 + Mongoose 9 | 3200 |
| **Base de datos** | MongoDB 7 | 27017 |

---

## 2. Pre-requisitos (infraestructura existente)

Estos pasos ya estan hechos en el VPS (documentados en la guia de Braillin):

- [x] VPS con Ubuntu 22/24 LTS
- [x] Usuario `deploy` con SSH (puerto 2222)
- [x] Docker + Docker Compose instalados
- [x] Red Docker `proxy` creada (`docker network create proxy`)
- [x] Traefik corriendo en `/opt/docker/traefik/`
- [x] Portainer corriendo en `/opt/docker/portainer/`
- [x] Firewall UFW configurado (SSH + 80 + 443)

> Si el VPS es nuevo, seguir las secciones 1-8 de la guia de Braillin antes de continuar.

---

## 3. Estructura en el servidor

```bash
# Conectar al servidor
ssh -p 2222 deploy@IP_DEL_VPS

# Crear carpeta del proyecto
mkdir -p /opt/docker/barberiaeljefe
cd /opt/docker/barberiaeljefe
```

Estructura final:

```
/opt/docker/barberiaeljefe/
├── docker-compose.yml
├── .env
├── repo/                      ← Codigo clonado desde GitHub
│   ├── backend/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   └── panel/
│       ├── Dockerfile
│       ├── nginx.conf
│       ├── package.json
│       └── src/
└── deploy.sh                  ← Script de deploy automatizado
```

### Clonar el repositorio

```bash
cd /opt/docker/barberiaeljefe
git clone https://github.com/TU_USUARIO/BarberiaElJefe.git repo
```

> Si el repo es privado:
> ```bash
> ssh-keygen -t ed25519 -f ~/.ssh/bej_deploy -N ""
> cat ~/.ssh/bej_deploy.pub
> # Copiar → GitHub → repo Settings → Deploy Keys → Add
>
> # Configurar SSH
> nano ~/.ssh/config
> ```
> ```
> Host github-bej
>     HostName github.com
>     User git
>     IdentityFile ~/.ssh/bej_deploy
> ```
> ```bash
> git clone git@github-bej:TU_USUARIO/BarberiaElJefe.git repo
> ```

---

## 4. Crear Dockerfile del backend

```bash
nano /opt/docker/barberiaeljefe/repo/backend/Dockerfile
```

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar codigo fuente
COPY src ./src

EXPOSE 3200

CMD ["node", "src/server.js"]
```

> A diferencia de Braillin (que usa Prisma), aca no hay paso de `prisma generate` porque Mongoose no necesita generacion de cliente.

---

## 5. Crear Dockerfile del frontend (multi-stage)

```bash
nano /opt/docker/barberiaeljefe/repo/panel/Dockerfile
```

```dockerfile
# === Stage 1: Build de Angular ===
FROM node:22-alpine AS build

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar todo el codigo fuente
COPY . .

# Build de produccion
RUN npx ng build --configuration production

# === Stage 2: Servir con Nginx ===
FROM nginx:1.27-alpine

# Copiar el build de Angular al directorio de Nginx
COPY --from=build /app/dist/panel/browser /usr/share/nginx/html

# Copiar config custom de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

> **Nota sobre el path del build:** Angular 19 genera el output en `dist/panel/browser/` (con subcarpeta `browser`). Verificar con un build local si la estructura difiere.

---

## 6. Crear config de Nginx interna

Este Nginx es INTERNO al proyecto. Traefik rutea el trafico al proyecto, y este Nginx se encarga de:
- Servir los archivos estaticos de Angular
- Proxy de `/api/` al container del backend
- SPA fallback (todas las rutas → `index.html`)

```bash
nano /opt/docker/barberiaeljefe/repo/panel/nginx.conf
```

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # === GZIP ===
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 1000;
    gzip_vary on;

    # === Assets estaticos con hash (cache agresivo) ===
    location ~* \.(js|css|woff2|woff|ttf|eot|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # === Imagenes ===
    location ~* \.(jpg|jpeg|png|gif|webp)$ {
        expires 30d;
        add_header Cache-Control "public";
        try_files $uri =404;
    }

    # === API (proxy al backend) ===
    location /api/ {
        proxy_pass http://bej-api:3200/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
        client_max_body_size 5M;
    }

    # === SPA fallback (Angular routing) ===
    location / {
        try_files $uri $uri/ /index.html;
    }

    # === Seguridad ===
    server_tokens off;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Bloquear archivos ocultos
    location ~ /\. {
        deny all;
    }
}
```

---

## 7. Crear .env de produccion

```bash
nano /opt/docker/barberiaeljefe/.env
```

```env
# === BASE DE DATOS ===
MONGO_INITDB_ROOT_USERNAME=bej_admin
MONGO_INITDB_ROOT_PASSWORD=GENERAR_PASSWORD_SEGURA
MONGO_INITDB_DATABASE=barberiaeljefe

# === BACKEND ===
PORT=3200
NODE_ENV=production

# Conexion a MongoDB (el host es "bej-db", nombre del container en la red Docker)
MONGODB_URI=mongodb://bej_admin:MISMA_PASSWORD@bej-db:27017/barberiaeljefe?authSource=admin

# CORS (cambiar al dominio real)
CORS_ORIGIN=https://eljefenegocios.com.ar

# === DOMINIO (usado en labels de Traefik) ===
DOMAIN=eljefenegocios.com.ar
```

**Generar passwords:**

```bash
openssl rand -base64 48
```

**Proteger el archivo:**

```bash
chmod 600 /opt/docker/barberiaeljefe/.env
```

---

## 8. Docker Compose del proyecto

```bash
nano /opt/docker/barberiaeljefe/docker-compose.yml
```

```yaml
services:
  # === BASE DE DATOS ===
  bej-db:
    image: mongo:7
    container_name: bej-db
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: ${MONGO_INITDB_DATABASE}
    volumes:
      - db_data:/data/db
    networks:
      - internal
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')", "-u", "${MONGO_INITDB_ROOT_USERNAME}", "-p", "${MONGO_INITDB_ROOT_PASSWORD}", "--authenticationDatabase", "admin"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 20s

  # === BACKEND (Node.js + Express + Mongoose) ===
  bej-api:
    build:
      context: ./repo/backend
      dockerfile: Dockerfile
    container_name: bej-api
    restart: unless-stopped
    env_file:
      - .env
    networks:
      - internal
    depends_on:
      bej-db:
        condition: service_healthy

  # === FRONTEND (Angular 19 + Tailwind + Nginx) ===
  bej-web:
    build:
      context: ./repo/panel
      dockerfile: Dockerfile
    container_name: bej-web
    restart: unless-stopped
    networks:
      - internal
      - proxy                         # Conectar a Traefik
    depends_on:
      - bej-api
    labels:
      # Traefik: rutear este dominio a este container
      - "traefik.enable=true"
      - "traefik.http.routers.bej.rule=Host(`${DOMAIN}`) || Host(`www.${DOMAIN}`)"
      - "traefik.http.routers.bej.entrypoints=websecure"
      - "traefik.http.routers.bej.tls.certresolver=letsencrypt"
      - "traefik.http.services.bej.loadbalancer.server.port=80"
      # Redirigir www → sin www
      - "traefik.http.routers.bej-www.rule=Host(`www.${DOMAIN}`)"
      - "traefik.http.routers.bej-www.entrypoints=websecure"
      - "traefik.http.routers.bej-www.tls.certresolver=letsencrypt"
      - "traefik.http.routers.bej-www.middlewares=bej-redirect-www"
      - "traefik.http.middlewares.bej-redirect-www.redirectregex.regex=^https://www\\.(.+)"
      - "traefik.http.middlewares.bej-redirect-www.redirectregex.replacement=https://$${1}"
      - "traefik.http.middlewares.bej-redirect-www.redirectregex.permanent=true"

networks:
  proxy:
    external: true                    # Red compartida con Traefik
  internal:
    driver: bridge                    # Red interna (solo este proyecto)

volumes:
  db_data:                            # Datos de MongoDB persistentes
```

---

## 9. Configurar DNS

En el panel del registrador de dominio:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | `@` | `IP_DEL_VPS` | 300 |
| A | `www` | `IP_DEL_VPS` | 300 |

Verificar propagacion:

```bash
dig eljefenegocios.com.ar +short
# Debe mostrar la IP del VPS
```

---

## 10. Deploy

```bash
cd /opt/docker/barberiaeljefe

# Buildear y levantar
docker compose up -d --build
```

Esto va a:
1. Crear el container MongoDB y esperar a que este healthy
2. Buildear la imagen del backend (instalar deps)
3. Buildear la imagen del frontend (instalar deps, build Angular 19, copiar a Nginx)
4. Levantar todo conectado

**Verificar:**

```bash
# Ver estado de los 3 containers
docker compose ps

# Ver logs (todos juntos)
docker compose logs -f

# Ver logs de un servicio especifico
docker compose logs -f bej-api
```

---

## 11. Seed inicial (solo primera vez)

Si hay un script de seed para crear datos iniciales:

```bash
cd /opt/docker/barberiaeljefe

# Ejecutar seed (si existe)
docker compose exec bej-api node src/seeds/seed.js
```

> Mongoose no necesita migraciones. Los schemas se sincronizan automaticamente al iniciar la app. Si se agregan indices, Mongoose los crea al conectar.

---

## 12. Verificacion post-deploy

### Checklist funcional

```
[ ] https://eljefenegocios.com.ar carga la pagina principal
[ ] https://eljefenegocios.com.ar/api/clientes responde (con auth si aplica)
[ ] Health check: curl https://eljefenegocios.com.ar responde JSON
[ ] Consulta publica: https://eljefenegocios.com.ar/api/publico/membresia?codigo=BEJ-0001
[ ] CRUD de clientes desde el panel funciona
[ ] Refresh en una ruta del panel NO da 404
[ ] http://eljefenegocios.com.ar redirige a https://
[ ] http://www.eljefenegocios.com.ar redirige a https://eljefenegocios.com.ar
```

### Verificar SSL

```bash
curl -I https://eljefenegocios.com.ar
# Verificar que responde 200 con headers de seguridad
```

---

## 13. Mantenimiento y operaciones

### 13.1 Comandos frecuentes

```bash
cd /opt/docker/barberiaeljefe

# === Estado ===
docker compose ps                      # Ver containers del proyecto
docker compose ps -a                   # Incluir parados

# === Logs ===
docker compose logs -f                 # Logs de todo el proyecto
docker compose logs -f bej-api         # Logs solo del backend
docker compose logs --tail 100 bej-api # Ultimas 100 lineas

# === Reiniciar ===
docker compose restart bej-api         # Reiniciar solo un servicio
docker compose restart                 # Reiniciar todo el proyecto

# === Parar / Levantar ===
docker compose stop                    # Parar todo (datos se conservan)
docker compose start                   # Volver a levantar
docker compose down                    # Parar y eliminar containers (volumenes se conservan)
docker compose down -v                 # PELIGRO: elimina containers Y volumenes (datos)

# === Rebuild ===
docker compose up -d --build           # Rebuild + restart
docker compose up -d --build bej-api   # Rebuild solo el backend

# === Shell interactivo ===
docker compose exec bej-api sh                        # Entrar al container del backend
docker compose exec bej-db mongosh -u bej_admin -p    # Entrar a MongoDB
```

### 13.2 Workflow de deploy (actualizar codigo)

```bash
cd /opt/docker/barberiaeljefe

# 1. Traer cambios
cd repo
git pull origin main
cd ..

# 2. Rebuild y restart
docker compose up -d --build

# 3. Verificar
docker compose ps
docker compose logs --tail 10 bej-api
curl -s https://eljefenegocios.com.ar
```

### 13.3 Script de deploy automatizado

```bash
nano /opt/docker/barberiaeljefe/deploy.sh
```

```bash
#!/bin/bash
set -e

echo "=== Deploying BarberiaElJefe ==="

cd /opt/docker/barberiaeljefe

echo ">>> Pulling latest code..."
cd repo
git pull origin main
cd ..

echo ">>> Building and restarting containers..."
docker compose up -d --build

echo ">>> Waiting for startup..."
sleep 5

echo ">>> Health check..."
docker compose exec -T bej-api wget -qO- http://localhost:3200/
echo ""

echo ">>> Container status:"
docker compose ps

echo ""
echo "=== Deploy complete ==="
```

```bash
chmod +x /opt/docker/barberiaeljefe/deploy.sh
./deploy.sh
```

### 13.4 Backups de MongoDB

#### Backup manual

```bash
cd /opt/docker/barberiaeljefe

# Dump de la base de datos
docker compose exec -T bej-db mongodump \
  --uri="mongodb://bej_admin:PASSWORD@localhost:27017/barberiaeljefe?authSource=admin" \
  --archive --gzip > backups/bej_$(date +%Y%m%d_%H%M%S).gz
```

#### Backup automatico diario

```bash
nano /opt/docker/barberiaeljefe/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/docker/barberiaeljefe/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="bej_${TIMESTAMP}.gz"

mkdir -p ${BACKUP_DIR}

docker compose -f /opt/docker/barberiaeljefe/docker-compose.yml \
  exec -T bej-db mongodump \
  --uri="mongodb://bej_admin:PASSWORD@localhost:27017/barberiaeljefe?authSource=admin" \
  --archive --gzip > "${BACKUP_DIR}/${FILENAME}"

# Eliminar backups de mas de 30 dias
find ${BACKUP_DIR} -name "*.gz" -mtime +30 -delete

echo "$(date): Backup created: ${FILENAME}" >> ${BACKUP_DIR}/backup.log
```

```bash
chmod +x /opt/docker/barberiaeljefe/backup-db.sh
```

Agregar al crontab:

```bash
crontab -e
```

```
# Backup diario a las 3 AM
0 3 * * * /opt/docker/barberiaeljefe/backup-db.sh
```

#### Restaurar un backup

```bash
cd /opt/docker/barberiaeljefe

docker compose exec -T bej-db mongorestore \
  --uri="mongodb://bej_admin:PASSWORD@localhost:27017/barberiaeljefe?authSource=admin" \
  --archive --gzip < backups/bej_20260730_030000.gz
```

---

## 14. Troubleshooting

### El sitio no carga / ERR_CONNECTION_REFUSED

```bash
# 1. Verificar que Traefik esta corriendo
docker ps | grep traefik
docker logs traefik --tail 30

# 2. Verificar que los containers del proyecto estan corriendo
cd /opt/docker/barberiaeljefe
docker compose ps
# Si algun container esta "Restarting" o "Exited":
docker compose logs bej-api --tail 50
docker compose logs bej-web --tail 50

# 3. Verificar que el DNS apunta bien
dig eljefenegocios.com.ar +short
```

### 502 Bad Gateway

```bash
# El container web esta corriendo pero no puede conectar al backend
docker compose logs bej-web --tail 30
docker compose logs bej-api --tail 30

# Verificar que el backend responde dentro de la red Docker
docker compose exec bej-web wget -qO- http://bej-api:3200/
```

### MongoDB no conecta

```bash
# Verificar que MongoDB esta healthy
docker compose ps bej-db
# Debe decir "healthy"

# Ver logs de MongoDB
docker compose logs bej-db --tail 30

# Probar conexion manual
docker compose exec bej-db mongosh -u bej_admin -p --authenticationDatabase admin

# Verificar MONGODB_URI en .env
# El host debe ser "bej-db" (nombre del container), NO "localhost"
```

### SSL no se genera

```bash
# Verificar logs de Traefik
docker logs traefik 2>&1 | grep -i "acme\|certificate\|error"

# Causas comunes:
# 1. DNS no apunta al VPS → verificar con: dig eljefenegocios.com.ar +short
# 2. Puerto 80 cerrado → verificar con: sudo ufw status
# 3. acme.json sin permisos → chmod 600 /opt/docker/traefik/acme.json
```

### Refresh en una ruta da 404

```bash
# Verificar la config de Nginx dentro del container
docker compose exec bej-web cat /etc/nginx/conf.d/default.conf | grep try_files
# Debe contener: try_files $uri $uri/ /index.html;

# Si no esta, rebuildar
docker compose up -d --build bej-web
```

### Rebuild falla por falta de memoria

```bash
# El build de Angular necesita RAM. Si el VPS tiene poca:

# Crear swap temporal
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Repetir el build
docker compose up -d --build
```

---

## Diferencias clave vs Braillin

| Aspecto | Braillin | BarberiaElJefe |
|---------|----------|----------------|
| **DB** | MySQL 8 + Prisma | MongoDB 7 + Mongoose |
| **Migraciones** | `npx prisma migrate deploy` | No necesita (Mongoose auto-sync) |
| **Backend port** | 3001 | 3200 |
| **Frontend** | Angular 20 | Angular 19 + Tailwind CSS 4 |
| **Uploads** | Volumen compartido backend/frontend | No aplica |
| **ORM** | Prisma (genera cliente) | Mongoose (sin generacion) |
| **Healthcheck DB** | `mysqladmin ping` | `mongosh db.adminCommand('ping')` |
| **Backup** | `mysqldump` | `mongodump --archive --gzip` |

---

## Resumen del flujo

```
 INFRAESTRUCTURA (ya hecha — ver guia Braillin secciones 1-8)
 ─────────────────────────────────────
 Traefik + Portainer + UFW + Docker ya corriendo

 DEPLOY DE BARBERIAELJEFE
 ─────────────────────────────────────
 1.  Crear carpeta /opt/docker/barberiaeljefe
 2.  Clonar repo
 3.  Crear Dockerfiles (backend + frontend)
 4.  Crear nginx.conf interno
 5.  Crear .env con secrets
 6.  Crear docker-compose.yml con labels de Traefik
 7.  Apuntar DNS al VPS
 8.  docker compose up -d --build
 9.  Seed inicial (si aplica)
 10. Verificar checklist

 UPDATES FUTUROS
 ─────────────────────────────────────
 git pull + docker compose up -d --build
```
