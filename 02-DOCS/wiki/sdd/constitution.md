---
type: constitution
title: cm-oficial — Constitution
description: Ratified constitution for Mistersofts commercial management system.
tags: [sdd, constitution]
timestamp: 2026-10-25T00:00:00Z
topic: sdd
status: ratified
version: 1.0.0
---

# cm-oficial — Constitution

> **Ratificada.** Cualquier cambio a esta constitución requiere PR, revisión y entrada en el log de enmiendas.

## Known facts

- Goal: Mistersofts — sistema de gestión comercial (Quasar 2 + Vue 3 + Vite + PHP 8.2 + MariaDB).
- Project kind: software · scope: complex.
- Cambios de código: ramas + PR; `main` cerrado a push directo.
- Stack ratificado: Node 20+, Vue 3 `<script setup>`, Quasar 2, Vite 5, PHP 8.2, MariaDB 10.6+.

## 1. Stack canon

- Frontend: Quasar 2, Vue 3 composition API (`<script setup>`), Vite.
- Backend: PHP 8.2 + MariaDB (repositorio externo `ct/api`, proxiado por `/api`).
- Testing: **Vitest** para unit + contract. **Playwright** para e2e, contra la app real (nunca `playwright.dev`).
- Formato: ESLint flat config vía `vite-plugin-checker` (ya configurado en `quasar.config.js:80-90`).

## 2. Quality bar

- Ningún PR se fusiona si `npm test` no ejecuta una suite real.
- Cobertura mínima: 70% de líneas en módulos tocados; **100% en los invariantes de §3**.
- Todo endpoint PHP consumido por el frontend debe tener prueba de contrato en `tests/contract/`.

## 3. Invariantes comerciales (MUST)

### 3.1 Ventas
- **INV-S-01** Una venta anulada emite un movimiento compensatorio; el registro original es inmutable.
- **INV-S-02** Una devolución referencia una línea existente y no excede la cantidad vendida (`validateReturn`).
- **INV-S-03** Total = Σ(qty × unit_price) − descuentos + impuestos, redondeado a 2 decimales (`computeSaleTotal`).

### 3.2 Inventario
- **INV-I-01** El stock se deriva de movimientos; `UPDATE stock` directo está prohibido.
- **INV-I-02** Todo producto con lote debe llevar `lot_code` en cada movimiento in/out.
- **INV-I-03** Disponible = Σ(in) − Σ(out) − reservado; stock negativo es rechazado en servidor.

### 3.3 Contabilidad
- **INV-A-01** Todo movimiento de caja/banco tiene contrapartida de doble entrada.
- **INV-A-02** Saldo CxC = Σ(facturas) − Σ(pagos) − Σ(notas de crédito).
- **INV-A-03** Cierre de caja requiere sesión abierta; sesión cerrada rechaza movimientos nuevos.

### 3.4 Autorización
- **INV-P-01** Escrituras en ventas/inventario/contabilidad requieren rol ∈ `{ADMINISTRADOR, VENTAS, PRODUCCION, ALMACEN}` según módulo (`src/config/routePolicy.js`).
- **INV-P-02** Toda operación destructiva (anular, devolver, cerrar, eliminar) deja fila de auditoría con usuario + timestamp.

## 4. Convenciones

- Archivos `kebab-case`; componentes Vue `PascalCase`.
- Commits en Conventional Commits.
- Endpoints: `/api/<recurso>`; escrituras llevan `codigo_md5` como idempotency key.

## 5. Branching & shipping

- Feature branch → PR. `main` protegido, requiere 1 aprobación + CI verde.
- `git reset --hard`, `git clean -fdx` y `rm -rf` sobre el árbol compartido están prohibidos (ver `opencode.json`).

## 6. Security & privacy floor

- Sin secretos en repo. Cada tool documenta variables en `01-TOOLS/<tool>/CREDENTIALS.md`.
- Toda autorización se verifica **en servidor**; el guard de rutas del frontend es UX, no seguridad.
- Operaciones destructivas requieren diálogo de confirmación + fila de auditoría.

## 7. UX / accesibilidad floor

- Toda mutación da feedback (toast + recarga opcional).
- Botones solo-icono llevan `aria-label` (p. ej. `HeaderLayout.vue:11`).

## 8. Performance budgets

- Bundle inicial ≤ 1.5 MB gzip.
- FCP ≤ 2.5 s en 3G.

## 9. Knowledge & decisions

- Índice de wiki: `02-DOCS/wiki/index.md`.
- Decisiones: `02-DOCS/wiki/harness/decisions.md` y `02-DOCS/wiki/sdd/decisions.md`.

## Definition of Done (merge bar)

Un cambio está done cuando:
1. `npm test` corre y pasa (unit + contract).
2. Invariantes §3 cubiertos o explícitamente no afectados.
3. ESLint sin errores.
4. 1 review aprobatoria.
5. El PR declara cumplimiento de esta constitución.

## Amendment log

| Date | Version | Change | Why |
|------|---------|--------|-----|
| 2026-10-26 | draft | Draft generado por `rsc onboard`. | Onboarding. |
| 2026-10-25 | 1.0.0 | Ratificación: invariantes comerciales, quality bar, security floor, DoD. | Auditoría `session-ses_e8a0` (issues 1, 2). |
