# Reporte de modificaciones Git desde 2026-03-27

## Alcance

- Rama analizada: `cambios-david2`
- Periodo: desde `2026-03-27 00:00:00` hasta la fecha actual del repositorio
- Fuente: historial Git local

## Resumen

- Commits detectados en el periodo: **11**
- Commits funcionales (sin integracion/merge por mensaje): **10**
- Archivos unicos modificados: **21**

## Commits del periodo

1. `78e3f42` | 2026-03-30 | correccion de subtitulos
2. `4e32de8` | 2026-03-30 | Merge branch 'develop' of https://github.com/aycaRichard12/cm-oficial into cambios-david2
3. `5776a14` | 2026-03-30 | correccion de errores con registrarcobro
4. `2a3c46e` | 2026-03-30 | refactor: Remove Caja Banco selection from FormCompra component to streamline the form
5. `f14068b` | 2026-03-30 | feat: Update CotizacionPage and pdfReportGenerator to enhance client signature handling and improve PDF generation logic
6. `7fe8929` | 2026-03-28 | feat: Mejora el visor de comprobantes y la logica de visualizacion de archivos en la tabla de detalles de cobros
7. `b1239d9` | 2026-03-28 | Refactorizacion de la pagina Cuentas por Cobrar: Extraccion de componentes y mejora de la estructura
8. `82e21dc` | 2026-03-27 | Anade especificacion de requerimientos para gestion de cotizaciones y mejora la logica de negocio en varios componentes: se implementan nuevos endpoints y se optimizan las interfaces de usuario en formularios y tablas
9. `30d7a25` | 2026-03-27 | feat: Mejora la pagina Cuentas por Cobrar con un manejo de imagenes optimizado y actualizaciones de la interfaz de usuario
10. `c903f7d` | 2026-03-27 | feat: Refactor Cuentas por Cobrar page and logic into composable
11. `9d1cc2d` | 2026-03-27 | Anade informacion de sesion del usuario en la pagina de permisos: se muestra el nombre completo del usuario que ha iniciado sesion y se actualizan las columnas de la tabla de operaciones

## Funcionalidades y tareas completadas

1. Correcciones visuales en inicio: ajuste de subtitulos.
2. Cuentas por cobrar: correcciones en registrar cobro.
3. Compras: simplificacion de formulario al retirar seleccion Caja/Banco.
4. Cotizaciones: mejora del manejo de firma de cliente y de la generacion de PDF.
5. Cuentas por cobrar: mejora del visor de comprobantes y visualizacion de archivos.
6. Cuentas por cobrar: refactor de pagina y extraccion de logica/componentes a composable.
7. Permisos de usuario: se agrega informacion de sesion del usuario y ajustes de columnas.
8. Cotizaciones y negocio: incorporacion de especificacion de requerimientos y mejoras de logica/UI en varios componentes.
9. Integracion de cambios de `develop` a la rama actual (commit de integracion).

## Archivos modificados (unicos)

1. `especificacion_requerimiento_cotizaciones.md`
2. `src/boot/axios.js`
3. `src/components/compra/FormCompra.vue`
4. `src/components/cuentasxCobrar/Reportes/ReporteCreditosTable.vue`
5. `src/components/venta/typeDoc.vue`
6. `src/composables/useVentas.js`
7. `src/composables/usuarios/vivasofts/menus/richard50.js`
8. `src/pages/compra/RcompraPage.vue`
9. `src/pages/config/permisosUsuariosPage.vue`
10. `src/pages/cotizacion/CotizacionPage.vue`
11. `src/pages/cuentasxcobrar/components/ComprobanteViewerDialog.vue`
12. `src/pages/cuentasxcobrar/components/DetallesCobrosView.vue`
13. `src/pages/cuentasxcobrar/components/FiltrosCxC.vue`
14. `src/pages/cuentasxcobrar/components/RegistrarCobroDialog.vue`
15. `src/pages/cuentasxcobrar/composables/useCuentasxCobrar.js`
16. `src/pages/cuentasxcobrar/CuentasxCobrarPage.vue`
17. `src/pages/cuentasxcobrar/reporteCuentasxCobrarPage.vue`
18. `src/pages/cuentasxcobrar/ReporteCuentasXCobrarPeriodo.vue`
19. `src/pages/IndexPage.vue`
20. `src/pages/puntoVenta/ApuntoVentaPage.vue`
21. `src/utils/pdfReportGenerator.js`
