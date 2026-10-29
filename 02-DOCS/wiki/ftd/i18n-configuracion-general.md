---
author: aycaRichard12
branch: feat/i18n-config-general
status: in-progress
---
# i18n de Configuración → General

## Intent

Traducir al inglés la sección **Configuración → General** y sus páginas asociadas, manteniendo el
español como idioma predeterminado y sin tocar el resto del sistema. El cambio permite alternar
idioma en caliente y conserva la elección entre sesiones.

## Scope

Dentro:

- Grupo `configuraciongeneral`: Tipo de Almacén, Divisas, Leyenda Proforma y Método de Inventario.
- Pestañas del grupo en la cabecera (`HeaderLayout.vue`).
- Formularios y tablas hijos de esas páginas.
- Infraestructura i18n global (`src/i18n`, `src/boot/i18n.js`) con locale `es-ES` por defecto.
- Selector de idioma único en el header global (`HeaderLayout.vue`), visible desde cualquier pantalla.

Fuera:

- Cualquier otra pantalla, menú o módulo del sistema.
- Lógica comercial, llamadas a la API, permisos, validaciones y estilos existentes.
- Traducción de datos provenientes del backend (nombres, descripciones, métodos guardados).

## Checklist

- [x] Configurar `vue-i18n` con `es-ES` por defecto y `en-US` — comprobado: `i18n-config-general.spec.js` (default).
- [x] Crear catálogos ES/EN con las mismas claves — comprobado: prueba de paridad de claves.
- [x] Añadir selector de idioma persistente en el header — comprobado: prueba de cambio y persistencia en localStorage + verificación estática de `HeaderLayout.vue`.
- [x] Traducir Tipo de Almacén, formulario y tabla — comprobado: lint + verificación estática de cableado.
- [x] Traducir Divisas, formulario y tabla — comprobado: lint + verificación estática de cableado.
- [x] Traducir Leyenda Proforma, formulario y tabla — comprobado: lint + verificación estática de cableado.
- [x] Traducir Método de Inventario (Kardex) — comprobado: lint + verificación estática de cableado.
- [x] Traducir las pestañas del grupo en la cabecera — comprobado: verificación estática de `HeaderLayout.vue`.
- [x] Compilar la aplicación sin errores — comprobado: `npx quasar build` → «Build succeeded».
- [x] Ejecutar lint — comprobado: `npm run lint` sin errores.

## Evidence

- `npx vitest run tests/unit/i18n-config-general.spec.js` → 10 pruebas pasadas (incluye cobertura de todas las claves usadas).
- `npm run lint` → sin errores (solo avisos preexistentes de ESLint/entorno).
- `npx quasar build` → SPA compilada con éxito.
- La suite completa `npx vitest run` pasa 69 pruebas; falla únicamente la suite E2E de Playwright
  `tests/e2e/theme.spec.js`, que Vitest no debe ejecutar (problema preexistente de configuración,
  ajeno a este cambio).

- Selector movido al header y eliminado de las 4 páginas para evitar duplicación; verificado con lint, 10 pruebas y build.

## Next

PR #100 abierto: https://github.com/aycaRichard12/cm-oficial/pull/100 (rama `feat/i18n-config-general` → `develop`).
