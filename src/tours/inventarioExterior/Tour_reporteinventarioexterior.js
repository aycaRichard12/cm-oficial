

export const Tour_reporteinventarioexterior = [
    {
        element: '#fechaInicio',
        popover: {
            title: 'Fecha Inicio',
            description: 'Selecciona la fecha inicial para el reporte de inventario exterior. Este es el límite inferior de la fecha de vencimiento que se considerará en el reporte.',
        }
    },
    {
        element: '#fechaFin',
        popover: {
            title: 'Fecha Final',
            description: 'Selecciona la fecha final para el reporte de inventario exterior. Este es el límite superior de la fecha de vencimiento que se considerará en el reporte.',
        }
    },
    {
        element: '#btnGenerarReporte',
        popover: {
            title: 'Generar Reporte',
            description: 'Haz clic aquí para generar el reporte de inventario exterior. El sistema calculará los lotes que cumplen con las fechas seleccionadas y mostrará un resumen de los productos con sus cantidades.',
        }
    },
    {
        element: '#tablaR',
        popover: {
            title: 'Tabla de Inventario Exterior',
            description: 'Aquí se muestra el inventario exterior de los productos. Cada fila representa un lote con su fecha de vencimiento y cantidad.',
        }
    },
    {
        element: '#btnVerPDF',
        popover: {
            title: 'Ver PDF',
            description: 'Haz clic aquí para ver el reporte de inventario exterior en formato PDF. El PDF incluirá un resumen de los lotes que cumplen con las fechas seleccionadas.',
        }
    }
]