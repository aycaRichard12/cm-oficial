export const Tour_reportecuentasporcobrarocultas = [
    {
        element: '#tituloreportecredito',
        popover: {
            title: 'Reporte de Cuentas por Cobrar',
            description: 'Bienvenido a la herramienta de generación de reportes generales para créditos y cuentas por cobrar.',
        }
    },
    {
        element: '#btntoggleventareportecredito',
        popover: {
            title: 'Tipo de Reporte',
            description: 'Cambia entre Reporte al Corte (buscando todos los históricos hasta una fecha límite específica) o en Periodo (en un rango de inicio y fin).',
        }
    },
    {
        element: '#fechainicioreportecredito',
        popover: {
            title: 'Fecha Inicio',
            description: 'Selecciona la fecha inicial del periodo del reporte (aplica solo cuando mides En Periodo).',
        }
    },
    {
        element: '#fechafinreportecredito',
        popover: {
            title: 'Fecha Fin / Fecha de Corte',
            description: 'Selecciona la fecha límite o de corte para delimitar el cálculo del reporte.',
        }
    },
    {
        element: '#btngenerarreportecredito',
        popover: {
            title: 'Generar',
            description: 'Haz clic aquí para obtener los registros del servidor con las fechas especificadas. Requisito obligatorio llenar primero las fechas.',
        }
    },
    {
        element: '#expansionfiltrosreportecredito',
        popover: {
            title: 'Filtros Avanzados',
            description: 'Despliega esta sección para poder filtrar los grandes resultados obtenidos por cliente, estado de la cuenta o sucursal antes de ver el reporte completo.',
        }
    },
    {
        element: '#filtroalmacenreportecredito',
        popover: {
            title: 'Almacén',
            description: 'Filtra las cuentas por un almacén en específico.',
        }
    },
    {
        element: '#filtroclientereportecredito',
        popover: {
            title: 'Cliente',
            description: 'Escribe y busca un cliente por su nombre o nit para ver sus deudas específicas.',
        }
    },
    {
        element: '#filtroestadoreportecredito',
        popover: {
            title: 'Estado del Crédito',
            description: 'Puedes filtrar para visualizar solo las deudas atrasadas, finalizadas/pagadas o activas a tiempo.',
        }
    },
    {
        element: '#btnlimpiarfiltrosreportecredito',
        popover: {
            title: 'Limpiar Búsquedas',
            description: 'Restaura y limpia las variables tecleadas en los selectores de arriba para ver sin filtros.',
        }
    },
    {
        element: '#btnexportarexcelreportecredito',
        popover: {
            title: 'Exportar a Excel',
            description: 'Descarga un archivo XLSX con todos los datos filtrados actualmente en la tabla, listos para ser trabajados.',
        }
    },
    {
        element: '#btnpdfreportecredito',
        popover: {
            title: 'Imprimir Reporte PDF',
            description: 'Genera una vista previa en documento PDF ordenado de todos los datos procesados en pantalla.',
        }
    },
    {
        element: '#tablareportecreditos',
        popover: {
            title: 'Tabla de Resultados',
            description: 'Aquí se muestran todas las cuentas por cobrar, el progreso de sus cuotas, los montos pagados y el saldo restante. Podrás ver sumatorias totales en la última fila.',
        }
    }
]