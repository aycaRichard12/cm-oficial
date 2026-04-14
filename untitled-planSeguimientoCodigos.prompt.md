## Plan: Seguimiento de códigos por lote y correlativo

**Decisiones preliminares del usuario:**

- Usar `ingreso` como la referencia de lote.
- Guardar el código concatenado (`codigo_unico`) en la base de datos.
- Puedes aplicar migrations en la base de datos.

- Correlativo: global por producto (no reinicia por lote).

TL;DR: Añadir trazabilidad por unidad creando una tabla de seriales (`producto_serial`) vinculada a `productos_almacen` y a lotes (usar `ingreso` o crear `lotes`). El código único será: `codigoProducto + codigoLote + correlativo`. Se validará unicidad y se expondrá en compras, ventas y reportes. Requiere cambios en DB, API y frontend.

**Steps**

1. Diseñar esquema DB: decidir si usar `ingreso` como lote o crear `lotes`; crear `producto_serial` con campos: id_serial, productos_almacen_id, serial, lote_id (o ingreso_id), correlativo, estado, venta_id, fecha_registro. Añadir unicidad en (lote_id, correlativo) y UNIQUE(serial).
2. Migraciones DB: preparar SQL de creación de tabla(s) y alteraciones (índices/constraints). _depends on decision del paso 1_
3. Backend/API: crear endpoints CRUD para seriales (asignar en compra, listar disponibles por producto_almacen, marcar vendido/baja), y actualizar endpoint de venta para consumir `producto_serial_id` dentro de transacción.
4. Frontend compras: en registro de ingreso permitir carga/entrada de seriales y asignar correlativos por lote; mapear respuesta del API para crear registros en `producto_serial`.
5. Frontend ventas: cuando producto sea serializable, mostrar selector de seriales disponibles al añadir al carrito; enviar `producto_serial_id` en `detalle_venta` y marcar como vendido.
6. Reportes: actualizar `ReporteVentas` y `reporteProductosVendidosGlobal` para incluir columna del código nuevo y filtros por lote/serial; crear un reporte separado si se desea desglosar por código único.
7. Anulación/mermas/extravio: añadir UI para seleccionar seriales y marcar `estado='baja'` (o 'perdido'), con endpoint que haga la actualización y ajuste stock.
8. Pruebas y verificación: migraciones en entorno de pruebas, pruebas de compra con seriales, venta que consume serial, reporte mostrando codes y pruebas de anulación.

**Relevant files**

- [src/pages/compra/RcompraPage.vue](src/pages/compra/RcompraPage.vue)
- [src/pages/compra/RepComprasPage.vue](src/pages/compra/RepComprasPage.vue)
- [src/pages/producto/CproductoPage.vue](src/pages/producto/CproductoPage.vue)
- [src/components/venta/ventaComponent.vue](src/components/venta/ventaComponent.vue)
- [src/stores/venta/carritoStore.js](src/stores/venta/carritoStore.js)
- [src/utils/venta.js](src/utils/venta.js)
- [src/pages/Venta/ReporteVentas.vue](src/pages/Venta/ReporteVentas.vue)
- [src/pages/reportes/reporteProductosVendidosGlobal.vue](src/pages/reportes/reporteProductosVendidosGlobal.vue)
- SQL dump: c:\Users\dark\Downloads\respaldo.sql

**Verification**

1. Ejecutar migration SQL en BD de prueba y validar que `UNIQUE(lote_id, correlativo)` y `UNIQUE(serial)` se crean.
2. Registrar una compra con varios seriales; comprobar filas en `producto_serial` y stock en `productos_almacen`.
3. Vender una unidad seleccionando un serial; comprobar `producto_serial.estado='vendido'` y `detalle_venta` incluye `producto_serial_id`.
4. Generar reporte de ventas y verificar columna del código único aparece y puede filtrarse por lote/serial.
5. Probar anular/marcar perdido: seleccionar uno o varios seriales, ejecutar endpoint y verificar cambios y ajuste de stock.

**Decisions / Supositions**

- Se propone almacenar campos separados (`producto_id`, `lote_id`, `correlativo`) y además un campo `codigo_unico` (VARCHAR) opcional con la concatenación para facilitar búsquedas/exports.
- Si `ingreso` ya funciona como `lote`, preferible reutilizarlo y apuntar `producto_serial.lote_id` a `ingreso.idingreso` para evitar migración de datos extensa.
- Correlativo puede reiniciarse por lote (recomendado), pero confirmar requisito del negocio.

**Further Considerations**

1. Backend: necesito acceso para aplicar migrations o que el DBA ejecute el SQL generado.
2. Performance: índices en `producto_serial(serial)`, `producto_serial(lote_id, correlativo)` y `producto_serial(productos_almacen_id)` son recomendados.
3. UX: para catálogo masivo de compras, permitir subir CSV/XLSX con seriales para asignar automáticamente.

Fecha: 2026-03-26
