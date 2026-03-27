# Especificación de Requerimientos: Gestión de Cotizaciones (Normal vs Preferencial)

**Objetivo:** Permitir la identificación, filtrado y procesamiento (anulación/devolución) de cotizaciones normales y preferenciales de forma independiente dentro del módulo de anulaciones.

## 1. Requerimientos de Datos (APIs de Listado)
Para que las tablas de "Válidas", "Anuladas" y "Devueltas" reflejen la información correcta, los siguientes endpoints deben ser actualizados:

*   **Endpoints:** `listaVentas`, `listadoanulaciones`, `listadevolucion`.
*   **Nuevo Campo Requerido:** `tipo_operacion` (Integer).
    *   `1`: Cotización Preferencial.
    *   `2`: Cotización Normal.
*   **Regla de integridad:** El campo `tipoventa` debe mantenerse en `-1` para todas las cotizaciones para no romper la lógica global del sistema.

## 2. Requerimientos de Lógica de Negocio (Acciones)
Los procesos de ejecución deben reconocer el subtipo de cotización mediante su ID:

### A. Anulaciones
*   **Endpoint:** `GET /api/anularCotizacion/${id}/${motivo}/${idusuario}`
*   **Requerimiento:** El backend debe procesar la anulación. Si el ID corresponde a una **Cotización Preferencial**, el sistema debe realizar automáticamente la liberación de firmas y registros de auditoría vinculados.

### B. Devoluciones
*   **Endpoint:** `POST /api/` (ver: `registroDevolucion`)
*   **Requerimiento:** Al registrar una devolución sobre una cotización (`tipo_dev: COT`), el backend debe validar el `tipo_operacion` original para asegurar que el reingreso de stock y el control de precios coincidan con las condiciones (normales o preferenciales) pactadas.

### C. Consulta de Estado
*   **Endpoint:** `GET /api/estadoCotizacion/${id}`
*   **Requerimiento:** Retornar el estado administrativo (Pendiente, Entregado, etc.) soportando ambos tipos de cotización por ID.

## 3. Implementación en el Componente `anulacionPage.vue`
El frontend realizará las siguientes adaptaciones utilizando los datos nuevos:

*   **Mapeo Interno:** Se asignará un ID interno (ej. `-2`) a las preferenciales solo para el motor de filtros de la tabla, manteniendo el ID original para las consultas a las APIs.
*   **Opciones de Filtro:** El dropdown "Tipo de Venta" se actualizará para mostrar:
    *   `comprobante de venta` (0)
    *   `cotizacion de venta normal` (-1)
    *   `cotizacion de venta preferencial` (-2)
*   **Compatibilidad de Acciones:** La función `handleAccion` se ajustará para que tanto el valor `-1` como `-2` invoquen correctamente los métodos `iniciarAnulacionCotizacion` y `verificarYProcesarDevolucion`.

---

**Resumen para el Equipo Backend:**
*"Para este requerimiento, solo necesitamos que añadan el campo `tipo_operacion` (1 o 2) en los resultados de los listados de ventas y anulaciones. Las APIs de acción (anular/devolver) deben seguir funcionando por ID, manejando internamente la lógica específica si la cotización es preferencial."*
