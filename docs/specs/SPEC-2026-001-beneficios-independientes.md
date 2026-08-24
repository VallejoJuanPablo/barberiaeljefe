# Spec: Beneficios como entidad independiente

- **Fecha:** 2026-08-24
- **Solicitado por:** Juan Pablo
- **Estado:** aprobada (turbo)
- **Spec ID:** SPEC-2026-001

## Contexto

El sistema actual de Barbería El Jefe maneja los beneficios como subdocumentos embebidos dentro de cada membresía. Esto genera duplicación de datos (el mismo beneficio "10% OFF en Tomate" aparece copiado en 6 de 8 planes) y hace que editar un beneficio requiera actualizarlo manualmente en cada plan que lo contenga.

El usuario necesita:
1. Administrar beneficios de forma independiente (CRUD propio)
2. Que cada beneficio tenga un código promocional opcional
3. Que las membresías solo referencien qué beneficios incluyen (relación, no copia)
4. Mantener la gestión de clientes asociados a membresías sin cambios funcionales

## Objetivo

Reestructurar el modelo de datos para que los beneficios sean una entidad independiente con CRUD propio, las membresías los referencien por ID (con populate), y se agregue un campo `codigo` (código promocional) a cada beneficio. El panel admin debe permitir gestionar beneficios por separado y asignarlos a membresías mediante checkboxes.

## User stories

### US-1: CRUD de beneficios
**Como** administrador
**Quiero** crear, editar, listar y eliminar beneficios de forma independiente
**Para** gestionar los beneficios sin tener que editar cada membresía

**Criterios de aceptación:**
- [ ] **Given** el admin está en el panel **When** navega a "Beneficios" **Then** ve un listado de todos los beneficios agrupados por categoría
- [ ] **Given** el admin está en el listado de beneficios **When** hace clic en "Nuevo beneficio" **Then** puede crear un beneficio con: nombre, categoría, icono, código promocional (opcional), estado activo/inactivo
- [ ] **Given** el admin edita un beneficio **When** cambia el nombre o código **Then** el cambio se refleja en todas las membresías que lo referencian
- [ ] **Given** el admin elimina un beneficio **When** confirma la eliminación **Then** se elimina el beneficio y se remueve de todas las membresías que lo referenciaban

### US-2: Código promocional en beneficios
**Como** administrador
**Quiero** asignar un código promocional a cada beneficio
**Para** que los clientes puedan usar ese código en el comercio aliado

**Criterios de aceptación:**
- [ ] **Given** el admin crea/edita un beneficio **When** ingresa un código promocional **Then** se guarda como campo `codigo` en el beneficio
- [ ] **Given** un beneficio tiene código y un cliente consulta su membresía **When** ve los beneficios de su plan **Then** ve el código promocional junto al beneficio
- [ ] **Given** un beneficio no tiene código **When** se muestra en la consulta **Then** no muestra ningún campo de código (no "N/A", simplemente no aparece)

### US-3: Membresías referencian beneficios
**Como** administrador
**Quiero** que al crear/editar una membresía pueda seleccionar beneficios existentes con checkboxes
**Para** no tener que escribir los beneficios manualmente en cada plan

**Criterios de aceptación:**
- [ ] **Given** el admin crea/edita una membresía **When** llega a la sección de beneficios **Then** ve checkboxes agrupados por categoría con todos los beneficios activos disponibles
- [ ] **Given** el admin marca/desmarca beneficios **When** guarda la membresía **Then** la membresía almacena los IDs de los beneficios seleccionados
- [ ] **Given** una membresía tiene beneficios referenciados **When** se consulta la membresía (API o panel) **Then** los beneficios se resuelven con populate mostrando nombre, categoría, icono y código

### US-4: Landing y consulta pública funcionan con el nuevo modelo
**Como** visitante/cliente
**Quiero** que la landing siga mostrando los beneficios agrupados y la consulta de membresía siga funcionando
**Para** que mi experiencia no cambie

**Criterios de aceptación:**
- [ ] **Given** la landing carga **When** obtiene los planes activos **Then** muestra los beneficios agrupados por categoría (con populate, sin duplicados)
- [ ] **Given** un cliente consulta su membresía por QR **When** la API responde **Then** incluye los beneficios del plan con nombre, categoría, icono y código (si tiene)

### US-5: Migración de datos existentes
**Como** sistema
**Quiero** que los beneficios embebidos existentes se migren a la nueva colección
**Para** no perder datos al cambiar el modelo

**Criterios de aceptación:**
- [ ] **Given** existen membresías con beneficios embebidos **When** se ejecuta el seed/migración **Then** se crean beneficios únicos en la colección Beneficio (sin duplicados)
- [ ] **Given** los beneficios se migraron **When** las membresías se actualizan **Then** referencian los IDs de los beneficios migrados

## Requisitos no funcionales
- Las APIs deben mantener compatibilidad en tiempos de respuesta (<200ms)
- El populate no debe generar N+1 queries
- La UI debe mantener el look & feel actual (tema dorado/negro, Tailwind CSS 4)

## Fuera de alcance
- Cambios en el modelo de Cliente (sigue igual)
- Cambios en autenticación/autorización
- Reordenamiento o priorización de beneficios
- Historial de cambios en beneficios

## Edge cases
| # | Escenario | Comportamiento esperado |
|---|-----------|------------------------|
| 1 | Eliminar beneficio que está en 5 membresías | Se elimina y se remueve la referencia de las 5 membresías |
| 2 | Membresía sin ningún beneficio seleccionado | Se permite guardar, sección de beneficios vacía |
| 3 | Beneficio con código vacío vs sin código | Ambos se tratan igual: no mostrar campo código |
| 4 | Dos beneficios con el mismo nombre | Se permite (pueden ser de distintas categorías) |
| 5 | Desactivar un beneficio que está en membresías activas | Se mantiene la referencia pero se filtra en el frontend (solo se muestran beneficios activos) |

## Dependencias
- MongoDB (colección nueva: beneficios)
- Mongoose populate para resolver referencias
