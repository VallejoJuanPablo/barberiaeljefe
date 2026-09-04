# BarberiaElJefe — Contexto Operativo

## Datos del proyecto
- **ID:** P11
- **Nombre:** BarberiaElJefe
- **Ruta:** ../Personal/BarberiaElJefe
- **Stack:** Node.js/Express + Angular 19 + MongoDB + Tailwind CSS 4
- **Metodología:** Sin DDD, desarrollo directo

## Descripción
Control de membresías para barbería. Funcionalidades principales:
1. **Panel admin** — CRUD de clientes, beneficios, marcas y membresías
2. **Web pública** — Landing con beneficios y marcas aliadas, consulta de membresía por QR
3. **API REST** — Backend Express con MongoDB, uploads de imágenes con multer

## Estructura
```
BarberiaElJefe/
├── backend/       ← Node.js + Express + Mongoose (puerto 3200)
│   └── src/
│       ├── models/Cliente.js, Beneficio.js, Membresia.js, Marca.js
│       ├── controllers/
│       ├── routes/
│       ├── seeds/seed.js, migrate-beneficios.js
│       └── server.js
│   └── uploads/marcas/  ← logos subidos
├── panel/         ← Angular 19 + Tailwind CSS 4
│   ├── nginx.conf ← config producción (proxy API + uploads)
│   └── src/
└── docs/
```

## Modelo de datos
**Beneficio:** (independiente, SPEC-2026-001)
- nombre, categoria, icono, codigo (promocional, opcional), activo

**Membresía:**
- nombre, precio, incluye[], beneficios: [ObjectId → Beneficio], descripcion, activa

**Marca:** (nueva)
- nombre, logo (upload imagen), instagram, activa, orden

**Cliente:**
- codigo (auto: BEJ-XXXX), nombre, telefono, email
- membresia: { activa, tipo, fechaInicio, fechaFin }

## API Endpoints
- `GET/POST /api/beneficios` — CRUD (auth)
- `GET/PUT/DELETE /api/beneficios/:id` — (auth)
- `GET/POST /api/marcas` — CRUD con upload multer (auth)
- `GET/PUT/DELETE /api/marcas/:id` — (auth)
- `GET/POST /api/membresias` — CRUD con populate (auth)
- `GET/PUT/DELETE /api/membresias/:id` — (auth)
- `GET/POST /api/clientes` — CRUD (auth)
- `GET/PUT/DELETE /api/clientes/:id` — (auth)
- `GET /api/publico/membresia?codigo=BEJ-0001` — Consulta pública (códigos promo visibles)
- `GET /api/publico/planes` — Planes activos (sin códigos promo)
- `GET /api/publico/marcas` — Marcas activas
- `/uploads/marcas/*` — Archivos estáticos (logos)

## Última sesión
2026-08-28 — Sección LA COMUNIDAD en landing
- Reemplazo sección "La experiencia / ¿Por qué El Jefe?" por "LA COMUNIDAD / Forma parte de la comunidad El Jefe"
- 3 bloques: Beneficios Únicos, Comunidad Activa, Experiencia VIP
- Mergeado a main, sin push

2026-08-25 — Marcas + upload + migración producción + fixes deploy
- Módulo Marcas completo: CRUD con upload de logo (multer), sección pública en landing
- Migración de datos de producción: 70 clientes, 9 membresías, 42 beneficios
- Script migrate-beneficios.js: convierte embebidos → refs (idempotente)
- Fix nginx: ^~ en /uploads/ para prioridad sobre regex de imágenes
- Fix: mkdir uploads automático en Docker
- Proxy config para dev (Angular → backend)
- Favicon actualizado a icon.png (corona dorada)
- Códigos promo ocultos en landing, solo visibles en consulta membresía

2026-08-24 — SPEC-2026-001: Beneficios como entidad independiente
- Beneficios extraídos de subdocumentos a colección propia con CRUD
- Campo código promocional, checkboxes en form membresía
- 14/14 criterios cumplidos, QC aprobado

## Deploy VPS
- Dominio: eljefenegocios.com.ar
- Infra: Docker + Traefik + Nginx, ruta /opt/docker/barberiaeljefe
- DB nombre en VPS: barberiaeljefe
- Volúmenes: db_data (MongoDB), uploads_data (logos marcas)
- Guías: docs/deploy-vps.md, docs/deploy-vps-produccion.md

## Pendiente
- [ ] Limpiar beneficios duplicados (variaciones menores de texto/mayúsculas)
- [ ] Asignar códigos promocionales reales a beneficios
- [ ] Implementar tests (Jest/Supertest)
- [ ] Testing en dispositivos reales
