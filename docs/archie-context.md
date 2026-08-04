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
2026-08-03 — Tarjetas QR + columna QR en panel
- Generador de tarjetas (generate-cards.js): sharp + qrcode, QR dorado sin fondo, código debajo, JPEG 1231x864 ~146KB
- 100 tarjetas generadas (BEJ-0001 a BEJ-0100) en panel/public/img/
- Columna QR en listado de clientes con popup modal (fondo blanco, botón copiar imagen al portapapeles)
- URL QR: https://eljefenegocios.com.ar/consulta_membresia?codigo=BEJ-XXXX
- Todo mergeado a main y pusheado

## Pendiente
- [ ] Configurar MongoDB (local o Atlas) para levantar en local
- [ ] Deploy en VPS (guía en docs/deploy-vps.md)
- [ ] Testing en dispositivos reales
