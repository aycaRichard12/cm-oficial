---
author: aycaRichard12
branch: develop
status: completed
---
# Permisos Etapa 01 — Configuración / General

## Intent

Implementar el sistema de permisos de página en los módulos de **Configuración / General** (Atajos, Método Inventario, Leyenda Proforma), siguiendo el contrato y patrón de referencia establecido en Divisas.

## Scope

Dentro:

- Auditoría de los módulos: Atajos, Método Inventario, Leyenda Proforma y Divisas.
- Implementación de permisos `[escritura, lectura, editar, eliminar]` mediante `obtenerPermisosPagina()`.
- Protección visual de acciones mediante `v-if`.
- Fallback con tarjeta de "Acceso Restringido" cuando `!lectura`.
- Protección en métodos de ejecución con `$q.notify` de advertencia.
- Auditoría de no modificación en Divisas (patrón de referencia preexistente).

Fuera:

- Módulos de etapas posteriores.
- Modificación de endpoints, lógica de negocio o datos.
- Commits, pushes o cambios de rama.

## Checklist

- [x] Auditar `src/pages/General/divisasGeneral.vue` y `src/components/general/divisa/TableDivisa.vue` (referencia intacta).
- [x] Implementar permisos en `src/pages/General/leyendaProformaGeneral.vue` — comprobado: lint y pruebas de contrato.
- [x] Implementar permisos en `src/components/general/Leyenda/TableLeyenda.vue` — comprobado: lint y `v-if` en botones.
- [x] Implementar permisos en `src/pages/cotizacion/configuraciontipoKardexPage.vue` — comprobado: lint y guarda de guardado.
- [x] Implementar permisos en `src/pages/AtajosConfig/ShortcutsConfigPage.vue` — comprobado: lint y guardas de guardado y eliminación.
- [x] Validar que no se tocan módulos de otras etapas — comprobado: `git status`.
- [x] Validar sintaxis y linting de archivos modificados — comprobado: `npx eslint`.
- [x] Ejecutar suite de pruebas unitarias asociadas — comprobado: `vitest run`.

## Evidence

- `npx eslint` ejecutado sobre los archivos modificados con 0 errores y 0 advertencias.
- `npx vitest run tests/unit/i18n-config-general.spec.js tests/unit/route-policy.spec.js` → 15 pruebas pasadas.
- `git status` confirma únicamente 4 archivos modificados en la etapa:
  - `src/components/general/Leyenda/TableLeyenda.vue`
  - `src/pages/General/leyendaProformaGeneral.vue`
  - `src/pages/cotizacion/configuraciontipoKardexPage.vue`
  - `src/pages/AtajosConfig/ShortcutsConfigPage.vue`

## Next

Esperar autorización explícita del usuario para proceder con la siguiente etapa.

