# BarberiaElJefe — Contexto Operativo

## Datos del proyecto
- **ID:** P11
- **Nombre:** BarberiaElJefe
- **Ruta:** ../Personal/BarberiaElJefe
- **Stack:** Node.js/Express + Angular 19 + MongoDB + Tailwind CSS 4
- **Metodología:** Sin DDD, desarrollo directo

## Descripción
Control de membresías para barbería. Tres funcionalidades principales:
1. **Panel admin** — CRUD de clientes, beneficios y membresías
2. **Web pública** — Consulta de estado de membresía por código de cliente (GET param)
3. **API REST** — Backend Express con MongoDB

## Estructura
```
BarberiaElJefe/
├── backend/       ← Node.js + Express + Mongoose (puerto 3200)
│   └── src/
│       ├── models/Cliente.js, Beneficio.js, Membresia.js
│       ├── controllers/
│       ├── routes/
│       └── server.js
├── panel/         ← Angular 19 + Tailwind CSS 4
│   └── src/
└── docs/
```

## Modelo de datos
**Beneficio:** (independiente)
- nombre, categoria, icono, codigo (promocional, opcional), activo

**Membresía:**
- nombre, precio, incluye[], beneficios: [ObjectId → Beneficio], descripcion, activa

**Cliente:**
- codigo (auto: BEJ-XXXX), nombre, telefono, email
- membresia: { activa, tipo (nombre membresía), fechaInicio, fechaFin }

## API Endpoints
- `GET/POST /api/beneficios` — Listar / Crear (auth)
- `GET/PUT/DELETE /api/beneficios/:id` — CRUD individual (auth)
- `GET/POST /api/membresias` — Listar / Crear (auth, con populate)
- `GET/PUT/DELETE /api/membresias/:id` — CRUD individual (auth, con populate)
- `GET/POST /api/clientes` — Listar / Crear (auth)
- `GET/PUT/DELETE /api/clientes/:id` — CRUD individual (auth)
- `GET /api/clientes/:id/logs` — Historial consultas (auth)
- `GET /api/publico/membresia?codigo=BEJ-0001` — Consulta pública
- `GET /api/publico/planes` — Planes activos (público)

## Última sesión
2026-08-24 — SPEC-2026-001: Beneficios como entidad independiente
- Beneficios extraídos de subdocumentos a colección propia con CRUD
- Campo código promocional agregado a beneficios
- Membresías referencian beneficios por ObjectId (populate)
- Panel admin: nueva sección Beneficios + checkboxes en form membresía
- Landing y consulta pública adaptadas al nuevo modelo
- QC: 14/14 criterios cumplidos, 3 fixes aplicados
- Rama: feature/beneficios-independientes (pendiente merge a main)

2026-08-13 — Landing sin planes + fix duplicados beneficios
- Landing: eliminada sección de tarjetas de planes/precios, solo beneficios
- Fix: deduplicación case-insensitive (toLowerCase + trim) en agruparBeneficios

2026-08-03 — Tarjetas QR + columna QR en panel
- Generador de tarjetas, 100 tarjetas generadas, columna QR en listado

## Pendiente
- [ ] Merge feature/beneficios-independientes a main
- [ ] Configurar MongoDB (local o Atlas) para levantar en local
- [ ] Ejecutar seed para poblar datos con nuevo modelo
- [ ] Implementar tests (Jest/Supertest)
- [ ] Deploy en VPS
- [ ] Asignar códigos promocionales reales a beneficios
