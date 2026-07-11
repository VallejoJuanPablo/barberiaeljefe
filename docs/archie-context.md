# BarberiaElJefe — Contexto Operativo

## Datos del proyecto
- **ID:** P11
- **Nombre:** BarberiaElJefe
- **Ruta:** ../Personal/BarberiaElJefe
- **Stack:** Node.js/Express + Angular 19 + MongoDB + Tailwind CSS 4
- **Metodología:** Sin DDD, desarrollo directo

## Descripción
Control de membresías para barbería. Tres funcionalidades principales:
1. **Panel admin** — CRUD de clientes con gestión de membresía (básica/premium/vip)
2. **Web pública** — Consulta de estado de membresía por código de cliente (GET param)
3. **API REST** — Backend Express con MongoDB

## Estructura
```
BarberiaElJefe/
├── backend/       ← Node.js + Express + Mongoose (puerto 3200)
│   └── src/
│       ├── models/Cliente.js
│       ├── controllers/
│       ├── routes/
│       └── server.js
├── panel/         ← Angular 19 + Tailwind CSS 4
│   └── src/
└── docs/
```

## Modelo de datos
**Cliente:**
- codigo (auto: BEJ-XXXX), nombre, telefono, email
- membresia: { activa, tipo (basica|premium|vip), fechaInicio, fechaFin }

## API Endpoints
- `GET /api/clientes` — Listar todos
- `GET /api/clientes/:id` — Obtener uno
- `POST /api/clientes` — Crear
- `PUT /api/clientes/:id` — Actualizar
- `DELETE /api/clientes/:id` — Eliminar
- `GET /api/publico/membresia?codigo=BEJ-0001` — Consulta pública

## Última sesión
2026-07-11 — Proyecto creado
- Backend inicializado (Express + Mongoose + CRUD + ruta pública)
- Frontend inicializado (Angular 19 + Tailwind CSS 4, build OK)
- Git init en rama feature/init
- Pendiente: componentes Angular (panel admin + página pública)
