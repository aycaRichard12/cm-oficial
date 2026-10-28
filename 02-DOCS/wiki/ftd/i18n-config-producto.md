---
author: Richard Ayca
branch: feat/i18n-header-selector
status: in-progress
---

# i18n — Configuración > Producto y Servicio

## Intent

Los textos visibles del módulo **Configuración > Producto y Servicio** (y sus páginas de
categoría, estado, unidad, característica, parámetros de obsolescencia, configuración de
producto único y configuración de variante) están en español fijo dentro del código.

El módulo hermano **Configuración > General** ya tiene selector de idioma funcional
(es-ES / en-US) con claves `configGeneral.*`. Falta el mismo tratamiento para el módulo de
Producto.

## Scope

- `src/i18n/es-ES/index.js` y `src/i18n/en-US/index.js`: nuevo namespace `configProducto`
  con `tabs` y una sección por página (`title`, `subtitle`, `dialogTitle`, `form.*`,
  `table.*`, `messages.*`, `options.*`).
- Páginas y componentes del módulo (`src/pages/ProductoConf/*`, `src/components/productoConf/*`,
  `src/pages/productoUnico/*`, `src/components/productoUnico/*`, `src/modules/config/*`).
- `src/layouts/HeaderLayout.vue`: títulos de tabs del subgrupo `configuracionproducto`.

Explicitamente fuera: lógica comercial, API, selector de idioma, diseño, otros módulos y rutas.

## Checklist

- [x] Las claves `es-ES` y `en-US` existen y son idénticas en estructura.
- [x] Ninguna traducción queda vacía.
- [x] Las páginas usan `useI18n` + `t('configProducto...')`.
- [x] Los tabs del grupo se traducen en el header.
- [x] El selector cambia idioma sin recargar y persiste.
- [x] Tests unitarios nuevos en `tests/unit/i18n-config-producto.spec.js`.
- [x] `vitest` y `eslint` en verde.

## Evidence

- `npx vitest run tests/unit/i18n-config-producto.spec.js`: 8 de 8 tests pasados en verde (paridad de 178 claves, cero vacíos, traducción de 7 tabs en cabecera, persistencia, cableado useI18n en páginas/componentes y cobertura de claves).
- `npx eslint`: 0 errores y 0 advertencias en los archivos del módulo y suite de tests.

## Next

- Commit y preparación de PR hacia `develop`.
