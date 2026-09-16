# Spec: Responsive Admin Panel — Card Layout

- **Fecha:** 2026-09-16
- **Solicitado por:** Juan Pablo
- **Estado:** implementada

## Contexto

El panel administrativo de Barbería El Jefe tiene 6 componentes principales: layout (sidebar + contenido), y 5 listados (clientes, beneficios, beneficios relámpago, marcas, membresías).

**Problemas actuales en mobile (< 768px):**

1. **Sidebar fija (w-64 = 256px)** — No colapsa en mobile. En una pantalla de 375px, el contenido queda en 119px, inutilizable.
2. **Tabla de clientes** — 7 columnas en `<table>` con `overflow-x-auto`. El usuario tiene que scrollear horizontalmente, pierde contexto.
3. **Headers de sección** — `flex justify-between` sin wrapping. El título y el botón "Nuevo" se solapan en pantallas chicas.
4. **Cards de beneficios/relámpago** — Los botones de acción (Editar/Eliminar) se comprimen contra el contenido en pantallas angostas.

**Lo que ya funciona bien:**
- Marcas: grid `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` — OK en mobile.
- Membresías: mismo grid responsive — OK en mobile.

## Objetivo

Hacer que todo el panel admin sea completamente usable en pantallas mobile (375px+). El sidebar se convierte en menú hamburguesa colapsable, y la tabla de clientes se reemplaza por card layout en mobile, manteniendo la tabla en desktop.

## User stories

### US-1: Sidebar responsive con hamburguesa
**Como** administrador en el celular
**Quiero** acceder al menú de navegación sin que ocupe toda la pantalla
**Para** poder ver y operar el contenido del panel

**Criterios de aceptación:**
- [ ] **Given** pantalla < 768px **When** cargo cualquier página admin **Then** la sidebar está oculta y aparece un botón hamburguesa en la parte superior
- [ ] **Given** sidebar oculta en mobile **When** toco el botón hamburguesa **Then** la sidebar se muestra como overlay con backdrop oscuro
- [ ] **Given** sidebar abierta en mobile **When** toco un enlace del menú o el backdrop **Then** la sidebar se cierra
- [ ] **Given** pantalla >= 768px **When** cargo cualquier página admin **Then** la sidebar se muestra fija como está hoy

### US-2: Clientes — Card layout en mobile
**Como** administrador en el celular
**Quiero** ver la lista de clientes en formato de cards en lugar de tabla
**Para** leer toda la información sin scrollear horizontalmente

**Criterios de aceptación:**
- [ ] **Given** pantalla < 768px **When** veo la lista de clientes **Then** cada cliente se muestra como card individual con: nombre, código, teléfono, badge de membresía, estado (activa/inactiva), y botones de acción
- [ ] **Given** pantalla < 768px **When** uso el buscador y filtro de estado **Then** las cards se filtran igual que la tabla
- [ ] **Given** pantalla >= 768px **When** veo la lista de clientes **Then** se muestra la tabla actual sin cambios
- [ ] **Given** card de un cliente inactivo en mobile **When** veo sus acciones **Then** aparece el botón "Renovar" además de Editar/Eliminar/QR

### US-3: Headers responsivos en todos los listados
**Como** administrador en el celular
**Quiero** que el título y botón "Nuevo" no se solapen
**Para** poder leer el título y acceder al botón fácilmente

**Criterios de aceptación:**
- [ ] **Given** pantalla < 640px **When** veo cualquier listado admin **Then** el título y el botón "Nuevo" se apilan verticalmente (flex-wrap o flex-col)
- [ ] **Given** pantalla >= 640px **When** veo cualquier listado admin **Then** título y botón se muestran en la misma línea como hoy

### US-4: Cards de beneficios/relámpago mejor espaciadas en mobile
**Como** administrador en el celular
**Quiero** que los botones de acción no se peguen al texto
**Para** poder tocar Editar/Eliminar sin tocar el botón equivocado

**Criterios de aceptación:**
- [ ] **Given** pantalla < 640px **When** veo un beneficio o beneficio relámpago **Then** los botones de acción se muestran debajo del contenido (stacked) en lugar de a la derecha
- [ ] **Given** pantalla >= 640px **When** veo un beneficio **Then** los botones se muestran al lado derecho como hoy

## Requisitos no funcionales

- **Breakpoints:** Seguir la convención existente del proyecto: `sm:` (640px), `md:` (768px), `xl:` (1280px)
- **Performance:** Sin JS adicional para media queries — solo Tailwind responsive classes. La sidebar usa signal para toggle.
- **Touch targets:** Botones de al menos 44x44px en mobile (estándar iOS/Android)
- **Animación:** Sidebar slide-in con `transition-transform duration-200` — rápida, no molesta
- **Sin librerías nuevas** — Todo con Tailwind CSS 4 que ya tiene el proyecto

## Componentes afectados

| Componente | Archivo | Cambio |
|------------|---------|--------|
| Admin Layout | `admin-layout.component.ts` | Sidebar colapsable + hamburguesa + backdrop |
| Cliente List | `cliente-list.component.ts` | Card layout mobile, tabla desktop (`hidden md:block` / `md:hidden`) |
| Beneficio List | `beneficio-list.component.ts` | Header wrap + acciones stacked en mobile |
| Beneficio Relámpago List | `beneficio-relampago-list.component.ts` | Header wrap + acciones stacked en mobile |
| Marca List | `marca-list.component.ts` | Solo header wrap (grid ya es responsive) |
| Membresía List | `membresia-list.component.ts` | Solo header wrap (grid ya es responsive) |

## Diseño de las client cards (mobile)

```
┌─────────────────────────────┐
│  BEJ-0042        ● Activa   │
│  Juan Pérez                  │
│  Tel: 3515551234             │
│  ┌─────────┐                 │
│  │ Premium  │                │
│  └─────────┘                 │
│  ┌────┐ ┌────┐ ┌──┐ ┌────┐  │
│  │ QR │ │Renov│ │✎│ │ 🗑 │  │
│  └────┘ └────┘ └──┘ └────┘  │
└─────────────────────────────┘
```

## Fuera de alcance

- Formularios de edición/creación — ya son single-column y funcionan en mobile
- Landing page pública — ya es responsive
- PWA / instalación como app
- Cambios en backend o modelos

## Edge cases

| # | Escenario | Comportamiento esperado |
|---|-----------|------------------------|
| 1 | Rotación de pantalla con sidebar abierta | Sidebar se cierra si pasa a >= 768px, se mantiene en landscape si sigue < 768px |
| 2 | Lista vacía en mobile | Mismo mensaje empty state centrado, sin card rota |
| 3 | Nombre de cliente muy largo en card | Truncate con ellipsis (`truncate`) |
| 4 | Modal QR abierto en mobile | Ya funciona (es fixed + centered), sin cambios |
| 5 | Modal de eliminar en mobile | Ya funciona (es fixed + centered), sin cambios |

## Dependencias

- Tailwind CSS 4 (ya instalado)
- Angular 19 signals (ya en uso)
- Sin dependencias nuevas

## Notas

- El proyecto ya usa el patrón `signal()` + `computed()` de Angular 19 en todos los componentes — la sidebar usará el mismo patrón para el toggle.
- Los otros listados (marcas, membresías) ya tienen grid responsive correcto. Solo necesitan el fix del header.
- Prioridad de implementación sugerida: 1) Layout sidebar, 2) Cliente cards, 3) Headers, 4) Beneficios spacing.
