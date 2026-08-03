# Deploy en VPS — BarberiaElJefe

Guia paso a paso para deployar el servicio (backend + panel) en un VPS con Docker, Nginx y Traefik.

## Requisitos previos

- VPS con Ubuntu 22+ o Debian 12+
- Docker y Docker Compose instalados
- Traefik configurado como reverse proxy (si ya lo tenes corriendo, saltar al paso 2)
- Dominio o subdominio apuntando al VPS (ej: `barberia.tudominio.com`)
- Git instalado en el servidor

## Paso 0 — Definir variables

Antes de empezar, definir estas variables que se usan en toda la guia:

```bash
# CAMBIAR ESTOS VALORES
DOMINIO="barberia.tudominio.com"       # Dominio EXACTO (verificar TLD: .com, .com.ar, etc.)
MONGO_PASSWORD=$(openssl rand -hex 32) # Solo hex, nunca base64 (evita / @ # en URLs)
```

> **Anotalo:** guarda `MONGO_PASSWORD` en un lugar seguro. Lo vas a necesitar en el .env.

---

## Paso 1 — Estructura en el servidor

```bash
mkdir -p /opt/barberia-el-jefe
cd /opt/barberia-el-jefe
```

---

## Paso 2 — Clonar el repositorio

```bash
git clone <URL_DEL_REPO> .
```

---

## Paso 3 — Configurar environment del frontend

Crear los archivos de environment para Angular (no existen todavia):

```bash
mkdir -p panel/src/environments
```

**`panel/src/environments/environment.ts`** (desarrollo):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3200/api'
};
```

**`panel/src/environments/environment.prod.ts`** (produccion):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://DOMINIO/api'
};
```

> Reemplazar `DOMINIO` con tu dominio real.

**Actualizar `panel/src/app/services/cliente.service.ts`** para usar environment:
```typescript
import { environment } from '../../environments/environment';

// Reemplazar:
//   private readonly baseUrl = 'http://localhost:3200/api';
// Por:
private readonly baseUrl = environment.apiUrl;
```

> Si no queres modificar el codigo ahora, la alternativa es que Nginx haga proxy de `/api` al backend (se cubre en el paso 5).

---

## Paso 4 — Configurar .env del backend

```bash
cat > backend/.env << EOF
PORT=3200
MONGODB_URI=mongodb://mongo-barberia:27017/barberia-el-jefe
EOF
```

> Nota: `mongo-barberia` es el nombre del servicio de MongoDB en Docker Compose (red interna, sin password si es solo acceso interno).

Si queres MongoDB con autenticacion:

```bash
cat > backend/.env << EOF
PORT=3200
MONGODB_URI=mongodb://barberia:${MONGO_PASSWORD}@mongo-barberia:27017/barberia-el-jefe?authSource=admin
EOF
```

---

## Paso 5 — Crear Dockerfiles

### Backend — `backend/Dockerfile`

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3200

CMD ["node", "src/server.js"]
```

### Frontend — `panel/Dockerfile`

```dockerfile
# Build stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npx ng build --configuration production

# Serve stage
FROM nginx:alpine

COPY --from=build /app/dist/panel/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

> Se usa `--legacy-peer-deps` para evitar conflictos de peer dependencies en Docker.

### Nginx config — `panel/nginx.conf`

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Angular SPA — redirect todo a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API al backend
    location /api/ {
        proxy_pass http://backend-barberia:3200/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache de assets estaticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

> Con este proxy de Nginx, el frontend puede usar `/api` como baseUrl sin necesidad de CORS ni dominio absoluto.

---

## Paso 6 — Docker Compose

Crear `docker-compose.yml` en la raiz del proyecto:

```yaml
services:
  mongo-barberia:
    image: mongo:7
    container_name: mongo-barberia
    restart: unless-stopped
    volumes:
      - mongo-data:/data/db
    networks:
      - barberia-net

  backend-barberia:
    build:
      context: ./backend
    container_name: backend-barberia
    restart: unless-stopped
    env_file:
      - ./backend/.env
    depends_on:
      - mongo-barberia
    networks:
      - barberia-net

  panel-barberia:
    build:
      context: ./panel
    container_name: panel-barberia
    restart: unless-stopped
    depends_on:
      - backend-barberia
    networks:
      - barberia-net
      - traefik-net
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.barberia.rule=Host(`${DOMINIO}`)"
      - "traefik.http.routers.barberia.entrypoints=websecure"
      - "traefik.http.routers.barberia.tls.certresolver=letsencrypt"
      - "traefik.http.services.barberia.loadbalancer.server.port=80"

volumes:
  mongo-data:

networks:
  barberia-net:
    driver: bridge
  traefik-net:
    external: true
```

> Si Traefik no esta configurado o vas a usar Nginx standalone, reemplazar las labels de Traefik por un mapeo de puertos: `ports: - "80:80"`.

---

## Paso 7 — Verificar Traefik

Si ya tenes Traefik corriendo, verificar la version de Docker API:

```bash
docker version --format '{{.Server.APIVersion}}'
```

En el docker-compose de Traefik, asegurar:
```yaml
environment:
  - DOCKER_API_VERSION=1.45   # Usar la version que devolvio el comando anterior
```

> Si Traefik v3.4 no arranca, probar con `traefik:v3.3`.

---

## Paso 8 — Build y arrancar

```bash
cd /opt/barberia-el-jefe

# Crear la red de Traefik si no existe
docker network create traefik-net 2>/dev/null || true

# Build y arrancar
docker compose up -d --build
```

Verificar que todo esta corriendo:
```bash
docker compose ps
docker compose logs -f --tail=50
```

---

## Paso 9 — Verificar el deploy

```bash
# Health check del backend
curl http://localhost:3200/

# Deberia devolver: {"version":"1.0.0","status":"OK"}

# Verificar desde el dominio
curl -I https://${DOMINIO}
```

Verificar en el navegador:
- Panel: `https://DOMINIO`
- API: `https://DOMINIO/api/clientes`
- Consulta publica: `https://DOMINIO/api/publico/membresia?codigo=BEJ-0001`

---

## Paso 10 — Mantenimiento

### Ver logs
```bash
docker compose logs -f backend-barberia
docker compose logs -f panel-barberia
```

### Actualizar despues de un push
```bash
cd /opt/barberia-el-jefe
git pull
docker compose up -d --build
```

### Backup de MongoDB
```bash
docker exec mongo-barberia mongodump --out /data/backup
docker cp mongo-barberia:/data/backup ./backup-$(date +%Y%m%d)
```

### Restaurar backup
```bash
docker cp ./backup-YYYYMMDD mongo-barberia:/data/backup
docker exec mongo-barberia mongorestore /data/backup
```

---

## Troubleshooting

| Problema | Solucion |
|----------|----------|
| Traefik no arranca | Verificar `DOCKER_API_VERSION` en su docker-compose |
| SSL no se genera | Verificar que el dominio apunta al VPS (DNS A record) |
| Frontend 404 en refresh | Verificar que `nginx.conf` tiene `try_files $uri $uri/ /index.html` |
| Backend no conecta a Mongo | Verificar que el servicio se llama `mongo-barberia` en docker-compose |
| CORS errors | No deberia pasar si usas el proxy de Nginx (`/api/`). Si persiste, configurar CORS en `backend/src/server.js` |
| `npm install` falla en Docker | Agregar `--legacy-peer-deps` en el Dockerfile del panel |
| Password con caracteres raros rompe Mongo URI | Regenerar con `openssl rand -hex 32` (solo letras a-f y numeros) |
