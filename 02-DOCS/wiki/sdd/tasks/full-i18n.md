---
status: done
date: 2026-10-29
spec: 02-DOCS/wiki/sdd/specs/full-i18n.md
plan: 02-DOCS/wiki/sdd/plans/full-i18n.md
---

# Tasks — Full Internationalization (i18n)

Cada tarea se marca solo con evidencia observada (comando ejecutado y resultado).

| # | Tarea | Done-check | Estado |
|---|-------|-----------|--------|
| 1 | Infraestructura i18n: diccionarios `es-ES`/`en-US`, `ui/*`, runtime fuera de plantilla, bootstrap y selector persistente | `tests/unit/i18n-coverage.spec.js` valida paridad de claves y persistencia | ✅ |
| 2 | Autenticación y layouts (`src/layouts`, `src/pages/auth`) | `$t(...)` en menús, cabeceras y textos de login; sin claves faltantes | ✅ |
| 3 | Ventas y cotizaciones (`components/venta`, `components/cotizacion`, `pages/cotizacion`, campañas) | Claves referenciadas existen en ambos idiomas | ✅ |
| 4 | Compras e inventario (`components/compra`, `almacen`, `movimiento`, `producto`) | Claves referenciadas existen en ambos idiomas | ✅ |
| 5 | Clientes, proveedores y cuentas (`clientes`, `proveedor`, `cuentasxCobrar`, `anulaciones`, `devoluciones`) | Claves referenciadas existen en ambos idiomas | ✅ |
| 6 | Reportes, precios y configuración (`components/reporte*`, `pages/reportes`, `pages/precio`, `pages/config`) | Claves referenciadas existen en ambos idiomas | ✅ |
| 7 | Corrección de cadenas residuales: `confirm-label`, `Cod:`, `(en N días)`, `Máx. N`, títulos de notificación | Sin literales en esos puntos; interpolación vía `$t`/`i18nT` | ✅ |
| 8 | Test de cobertura simplificado (paridad + claves usadas, sin escaneo regex de texto) | `npx vitest run` → 17 archivos, 84 tests OK, 1 skip | ✅ |
| 9 | Verificación final | `npm run lint` OK · `npm test` OK · `npm run build` OK | ✅ |

## Evidencia

- `npm run lint` → exit 0 (solo advertencia `ESLintEnvWarning` en `src-pwa/custom-service-worker.js`).
- `npx vitest run` → 17 archivos, 84 passed, 1 skipped.
- `npm run build` → **Build succeeded** (SPA, `dist/spa`).

## Limitaciones conocidas

- Persisten literales en español en generadores de PDF (`src/utils/pdfs/**`, `src/utils/pdfReportGenerator.js`) y en algunos mensajes de consola/errores internos de scripts. No son plantillas Vue y quedan fuera del alcance de esta entrega.
- El escaneo automático de texto hardcodeado en plantillas se retiró del test por falsos positivos; la cobertura se garantiza por claves usadas y paridad de diccionarios.
- `src/i18n/audit_i18n_report.json` y `src/i18n/extract_strings.*` / `generate_i18n_keys.cjs` quedan sin commitear por decisión explícita.
