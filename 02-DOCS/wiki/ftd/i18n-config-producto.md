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

- [ ] Las claves `es-ES` y `en-US` existen y son idénticas en estructura.
- [ ] Ninguna traducción queda vacía.
- [ ] Las páginas usan `useI18n` + `t('configProducto...')`.
- [ ] Los tabs del grupo se traducen en el header.
- [ ] El selector cambia idioma sin recargar y persiste.
- [ ] Tests unitarios nuevos en `tests/unit/i18n-config-producto.spec.js`.
- [ ] `vitest` y `eslint` en verde.

## Evidence

- Pendiente.

## Next

- Ejecutar la batería de tests y lint; registrar resultado.
