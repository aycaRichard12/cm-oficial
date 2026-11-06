# Fix de errores ESLint — configuración de producto

**Fecha:** 2026-11-06
**Tipo:** corrección puntual (FTD)
**Estado:** hecho

## Intención

Dejar sin errores de ESLint tres archivos que además quedaban rotos en tiempo de ejecución:
`configuracioPU.vue` (bloque de props mal cerrado), `parametroObsolescencia.vue` (imports de Vue
faltantes) y `ConfiguracionPage.vue` (variable `md5` declarada sin usar y guard de permisos sin
implementar).

## Cambios

| Archivo | Cambio |
| --- | --- |
| `src/components/productoUnico/configuracioPU.vue` | Se arregla `defineProps`: `md5` estaba fuera del objeto de props. Se usa `puedeEditar` en `:disable` del toggle. |
| `src/pages/ProductoConf/parametroObsolescencia.vue` | Se importa `ref`, `onMounted`, `onBeforeUnmount` desde `vue`. |
| `src/pages/productoUnico/ConfiguracionPage.vue` | Se pasa `:md5="md5"` al componente (antes quedaba sin usar) y se agrega `obtenerPermisosPagina()` + `useI18n()` para `lectura`, `editar`, `escritura` y `t`. |

## Evidencia

```
npx eslint ... configuracioPU.vue ConfiguracionPage.vue parametroObsolescencia.vue
# sin mensajes
npx eslint ... <archivos modificados en git diff>
# sin mensajes
```

## Siguiente paso

Revisar la pantalla de configuración de producto único con un usuario sin permiso de escritura
para confirmar que el toggle queda deshabilitado.
