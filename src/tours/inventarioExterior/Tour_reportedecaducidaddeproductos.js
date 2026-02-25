export const Tour_reportedecaducidaddeproductos = [
    {
        element: '#fechaFinalR',
        popover: {
            title: ' Fecha de Corte',
            description: 'Selecciona la fecha límite hasta la cual deseas analizar la caducidad de los productos. El sistema calculará cuántos días le quedan a cada lote para vencer respecto a esta fecha.',
        }
    },
    {
        element: '#btnGenerarReporte',
        popover: {
            title: ' Generar Reporte',
            description: 'Haz clic aquí para procesar los datos del inventario externo y calcular los días de vencimiento de cada lote de producto. Los resultados se colorearán automáticamente según su urgencia.',
        }
    },
    {
        element: '#btnExportarExcel',
        popover: {
            title: 'Exportar a Excel',
            description: 'Descarga toda la tabla de caducidad en formato CSV compatible con Excel, incluyendo tanto la tabla detallada de productos como el resumen por categorías de urgencia.',
        }
    },
    {
        element: '#almacenR',
        popover: {
            title: ' Filtrar por Almacén',
            description: 'Si tienes acceso a varios almacenes, puedes seleccionar uno específico para ver únicamente los productos de ese almacén. Por defecto muestra todos los almacenes disponibles.',
        }
    },
    {
        element: '#clienteR',
        popover: {
            title: ' Filtrar por Cliente',
            description: 'Busca y selecciona un cliente específico para ver solo los productos en consignación o inventario externo asignados a ese cliente. Escribe parte del nombre o código para filtrar la lista.',
        }
    },
    {
        element: '#tablaR',
        popover: {
            title: ' Tabla de Caducidad Detallada',
            description: 'Aquí se muestran todos los productos con sus lotes y fechas de vencimiento. Cada celda de cantidad se colorea según la urgencia: rojo indica vencimiento inminente, otros colores indican distintos rangos de tiempo restante configurados en los parámetros del sistema.',
        }
    },
    {
        element: '#tablaResumenR',
        popover: {
            title: ' Tabla Resumen por Urgencia',
            description: 'Esta tabla consolida las cantidades de cada producto agrupadas por categoría de urgencia (colores). Te permite visualizar de un vistazo cuántas unidades están en estado crítico, moderado o seguro para cada artículo.',
        }
    }
]