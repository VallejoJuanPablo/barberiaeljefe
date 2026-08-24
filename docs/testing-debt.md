# Testing Debt — BarberiaElJefe

> Generado automáticamente por Archie al analizar features sin cobertura.
> Última actualización: 2026-08-24

## Resumen
- **Tests existentes:** 0 (sin infra configurada)
- **Deuda acumulada:** 5 áreas sin cobertura
- **Prioridad máxima:** P1

## Deuda de testing

| # | Feature / Módulo | Tipo de test necesario | Prioridad | SPEC origen | Estado |
|---|-----------------|----------------------|-----------|-------------|--------|
| 1 | API REST clientes (6 endpoints) | integration: CRUD + consulta pública | P1 | N/A | pendiente |
| 2 | API REST beneficios (5 endpoints) | integration: CRUD + cascade delete | P1 | SPEC-2026-001 | pendiente |
| 3 | API REST membresías (5 endpoints + populate) | integration: CRUD + populate beneficios | P1 | SPEC-2026-001 | pendiente |
| 4 | Generador de tarjetas QR | unit: generate-cards.js output | P3 | N/A | pendiente |
| 5 | Landing page + endpoint planes | e2e: carga landing + agrupación beneficios + fallback | P2 | SPEC-2026-001 | pendiente |

## Notas
- Proyecto con 3 modelos (Cliente, Beneficio, Membresía) y auth JWT
- Beneficios con cascade delete ($pull de membresías) — requiere test específico
- Populate de beneficios en membresías — verificar que devuelve datos completos
