<template>
  <q-page padding>
    <div class="titulo">Caducidad Producto</div>
    <q-card-section>
      <div class="row justify-center q-mb-md">
        <div class="col-12 col-md-4">
          <label for="fechafinal">Fecha Final*</label>
          <q-input
            label="Fecha Final*"
            type="date"
            dense
            outlined=""
            v-model="fechaFinal"
            class="fecha-actualFT"
          />
        </div>
      </div>

      <div class="row justify-center q-mb-md">
        <q-btn color="primary" label="Generar reporte" @click="generarReporte" class="q-mr-sm" />
        <q-btn color="primary" @click="exportarTablaAExcel" class="btn-res">
          <q-icon name="mdi-file-excel" class="icono" />
          <span class="texto">Exportar a Excel</span>
        </q-btn>
      </div>

      <div class="row q-col-gutter-x-md">
        <div class="col-12 col-md-4">
          <label for="almacen">Almacén</label>
          <q-select
            dense
            outlined
            v-model="almacenSeleccionado"
            :options="almacenesOptions"
            option-value="idalmacen"
            option-label="almacen"
            :disable="!fechaFinal"
            @update:model-value="filtrarYOrdenarDatos"
          />
        </div>
        <div class="col-12 col-md-8">
          <label for="razonSocial">Razón Social*</label>
          <q-select
            dense
            outlined
            v-model="clienteSeleccionado"
            :options="clientesFiltrados"
            option-value="id"
            option-label="label"
            use-input
            input-debounce="300"
            @filter="filtrarClientes"
            @update:model-value="filtrarYOrdenarDatos"
            clearable
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.nit }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </div>

      <div class="row q-col-gutter-x-md q-mt-md">
        <div class="col-12 col-md-8">
          <div style="max-height: 60vh; overflow-y: auto">
            <q-table
              title="Inventario Externo"
              dense
              :rows="datosTablaPrincipal"
              :columns="columnasTablaPrincipal"
              row-key="index"
              hide-bottom
              :pagination="{ rowsPerPage: 0 }"
            >
              <template v-slot:body-cell="props">
                <q-td :props="props" :style="props.row[props.col.name + '_style'] || ''">
                  {{ props.value }}
                </q-td>
              </template>
            </q-table>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div style="max-height: 60vh; overflow-y: auto">
            <q-table
              title="Resumen"
              dense
              :rows="datosTablaResumen"
              :columns="columnasTablaResumen"
              row-key="index"
              hide-bottom
              :pagination="{ rowsPerPage: 0 }"
            >
              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :style="'background-color:' + col.color"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>
              <template v-slot:body-cell-detalle="props">
                <q-tr :props="props">
                  {{ datosTablaResumen }}
                </q-tr>
              </template>
            </q-table>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const $q = useQuasar()

// Datos del componente
const fechaFinal = ref('')
const almacenSeleccionado = ref(null)
const clienteSeleccionado = ref(null)
const almacenesOptions = ref([])
const clientesOptions = ref([])
const clientesFiltrados = ref([])
const datosOriginales = ref([])
const datosFiltrados = ref([])
const medidores = ref([])
const datosTablaPrincipal = ref([])
const datosTablaResumen = ref([])
const columnasTablaPrincipal = ref([])
const columnasTablaResumen = ref([])
const nombrecolores = {
  '#FF0000': 'Rojo',
  '#00FF00': 'Verde',
  '#0000FF': 'Azul',
  '#FFFF00': 'Amarillo',
  '#FFA500': 'Naranja',
  '#800080': 'Morado',
  '#FFC0CB': 'Rosado',
  '#000000': 'Negro',
  '#FFFFFF': 'Blanco',
  '#808080': 'Gris',
  '#8B4513': 'Marrón',
  '#87CEEB': 'Celeste',
}

// Obtener usuario y empresa
const obtenerUsuario = () => {
  // Implementar lógica para obtener usuario según tu aplicación
  return { idusuario: idusuario, empresa: { idempresa: idempresa } }
}

// Métodos
const obtenerFechaActual = () => {
  const today = new Date()
  const dd = String(today.getDate()).padStart(2, '0')
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const yyyy = today.getFullYear()
  return `${yyyy}-${mm}-${dd}`
}

const cargarAlmacenes = async () => {
  try {
    const usuario = obtenerUsuario()
    const response = await api.get(`listaResponsableAlmacenReportes/${usuario.empresa.idempresa}`)
    console.log(response)
    almacenesOptions.value = [
      { idalmacen: 0, almacen: 'Todos los almacenes' },
      ...response.data.filter((u) => u.idusuario == usuario.idusuario),
    ]
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los almacenes',
    })
  }
}

const cargarClientes = async () => {
  try {
    const usuario = obtenerUsuario()
    const response = await api.get(`listaCliente/${usuario.empresa.idempresa}`)
    console.log(response)
    clientesOptions.value = response.data.map((cliente) => ({
      id: cliente.id,
      label: `${cliente.codigo} - ${cliente.nombre} - ${cliente.nombrecomercial}`,
      nombre: cliente.nombre,
      nit: cliente.nit,
      ciudad: cliente.ciudad,
      nombrecomercial: cliente.nombrecomercial,
    }))

    clientesFiltrados.value = [...clientesOptions.value]
  } catch (error) {
    console.error('Error al cargar clientes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los clientes',
    })
  }
}

const filtrarClientes = (val, update) => {
  update(() => {
    if (val === '') {
      clientesFiltrados.value = clientesOptions.value
    } else {
      const needle = val.toLowerCase()
      clientesFiltrados.value = clientesOptions.value.filter(
        (v) => v.label.toLowerCase().indexOf(needle) > -1,
      )
    }
  })
}

const restarFechasEnDias = (fecha1, fecha2) => {
  fecha1.setHours(0, 0, 0, 0)
  fecha2.setHours(23, 59, 59, 999)

  const milisegundosPorDia = 24 * 60 * 60 * 1000
  const fecha1Millis = fecha1.getTime()
  const fecha2Millis = fecha2.getTime()

  const diferenciaMillis = fecha2Millis - fecha1Millis
  const dias = diferenciaMillis / milisegundosPorDia

  return Math.round(dias)
}

const obtenerColorPorDiferencia = (nro, cantidad, diferenciadias, data) => {
  let colorDefecto = '#000000'

  for (const item of data) {
    if (diferenciadias <= parseInt(item.valor)) {
      return item.color
    }
  }

  return colorDefecto
}

const generarReporte = async () => {
  if (!fechaFinal.value) {
    $q.notify({
      type: 'warning',
      message: 'Ingrese la fecha final',
    })
    return
  }

  try {
    const usuario = obtenerUsuario()

    const [response1, response2] = await Promise.all([
      api.get(`reporteinventarioexterno/${usuario.idusuario}`),
      api.get(`listaParametro/${usuario.empresa.idempresa}`),
    ])

    datosOriginales.value = response1.data
    datosFiltrados.value = response1.data
    medidores.value = response2.data

    cargarDatos()
    await cargarAlmacenes()
    await cargarClientes()
  } catch (error) {
    console.error('Error al generar reporte:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el reporte',
    })
  }
}

const filtrarYOrdenarDatos = () => {
  let datos = [...datosOriginales.value]

  if (almacenSeleccionado.value && almacenSeleccionado.value.idalmacen !== 0) {
    datos = datos.filter((u) => u.idalmacen == almacenSeleccionado.value.idalmacen)
  }

  if (clienteSeleccionado.value) {
    datos = datos.filter((u) => u.idcliente == clienteSeleccionado.value.id)
  }

  datosFiltrados.value = datos
  cargarDatos()
}

const cargarDatos = () => {
  if (!datosFiltrados.value.length || !medidores.value.length) return

  const data = datosFiltrados.value
  const data1 = medidores.value
  const dateA = fechaFinal.value

  // Procesar datos para la tabla principal
  let filas = {}

  data.forEach(function (producto) {
    let codigo = producto.codigo

    if (!filas[codigo]) {
      filas[codigo] = {
        codigo: codigo,
        descripcion: producto.descripcion,
        fechavencimientos: [],
        cantidades: [],
      }
    }

    filas[codigo].fechavencimientos.push(producto.fechavencimiento)
    filas[codigo].cantidades.push(producto.cantidad)
  })

  // Crear columnas dinámicas
  const maxColumnas = Math.max(...Object.values(filas).map((f) => f.fechavencimientos.length))
  const columnasBase = [
    { name: 'index', label: 'N°', field: 'index', align: 'left' },
    { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
    { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  ]

  for (let i = 0; i < maxColumnas; i++) {
    columnasBase.push(
      { name: `fecha_${i}`, label: 'Fecha', field: `fecha_${i}`, align: 'left' },
      {
        name: `cantidad_${i}`,
        label: 'Cantidad',
        field: `cantidad_${i}`,
        align: 'left',
      },
    )
  }

  columnasTablaPrincipal.value = columnasBase

  // Procesar filas para la tabla principal
  const rowsPrincipal = []
  let index = 1
  const objtablamedidor = []

  for (let key in filas) {
    if (key) {
      let fila = filas[key]
      let rowData = {
        index: index,
        codigo: fila.codigo,
        descripcion: fila.descripcion,
      }

      for (let i = 0; i < fila.fechavencimientos.length; i++) {
        const diferenciadias = restarFechasEnDias(
          new Date(fila.fechavencimientos[i]),
          new Date(dateA),
        )

        const color = obtenerColorPorDiferencia(index, fila.cantidades[i], diferenciadias, data1)

        rowData[`fecha_${i}`] = fila.fechavencimientos[i]
        rowData[`cantidad_${i}`] = fila.cantidades[i]
        rowData[`cantidad_${i}_style`] =
          `background-color: ${color}; ${color === '#000000' ? 'color: #FFFFFF;' : ''}`

        objtablamedidor.push({
          nro: index,
          cantidad: fila.cantidades[i],
          nombre: nombrecolores[color] || 'Desconocido',
          color: color,
        })
      }

      rowsPrincipal.push(rowData)
      index++
    }
  }

  datosTablaPrincipal.value = rowsPrincipal

  // Procesar datos para la tabla resumen
  const columnasResumen = [{ name: 'index', label: 'N°', field: 'index', align: 'left' }]
  console.log(data1)
  data1.forEach((item) => {
    columnasResumen.push({
      name: item.nombre,
      label: item.nombre,
      field: nombrecolores[item.color],
      align: 'right',
      color: item.color,
    })
  })

  columnasTablaResumen.value = columnasResumen

  // Agrupar y sumar por número
  const resultado = []
  const mapeo = {}
  console.log(objtablamedidor)
  for (const item of objtablamedidor) {
    const nro = item.nro
    const nombre = item.nombre
    const cantidad = parseInt(item.cantidad)

    if (!mapeo[nro]) {
      mapeo[nro] = {}
    }

    if (!mapeo[nro][nombre]) {
      mapeo[nro][nombre] = 0
    }

    mapeo[nro][nombre] += cantidad
  }

  for (const nro in mapeo) {
    const row = { index: parseInt(nro) }
    for (const nombre in mapeo[nro]) {
      row[nombre] = mapeo[nro][nombre]
    }
    resultado.push(row)
  }
  console.log(resultado)
  datosTablaResumen.value = resultado
}

const exportarTablaAExcel = () => {
  if (!datosTablaPrincipal.value.length) {
    $q.notify({
      type: 'warning',
      message: 'No hay datos para exportar',
    })
    return
  }

  try {
    // Crear contenido CSV
    let csvContent = 'data:text/csv;charset=utf-8,'

    // Encabezados tabla principal
    const headersPrincipal = columnasTablaPrincipal.value.map((col) => col.label).join(',')
    csvContent += headersPrincipal + '\r\n'

    // Filas tabla principal
    datosTablaPrincipal.value.forEach((row) => {
      const rowData = columnasTablaPrincipal.value
        .map((col) => {
          if (col.field === 'index') return row.index
          if (col.field === 'codigo') return `"${row.codigo}"`
          if (col.field === 'descripcion') return `"${row.descripcion}"`

          const fieldParts = col.field.split('_')
          if (fieldParts[0] === 'fecha' || fieldParts[0] === 'cantidad') {
            return row[col.field] || ''
          }

          return ''
        })
        .join(',')

      csvContent += rowData + '\r\n'
    })

    // Espacio entre tablas
    csvContent += '\r\n\r\n'

    // Encabezados tabla resumen
    const headersResumen = columnasTablaResumen.value.map((col) => col.label).join(',')
    csvContent += headersResumen + '\r\n'

    // Filas tabla resumen
    datosTablaResumen.value.forEach((row) => {
      const rowData = columnasTablaResumen.value
        .map((col) => {
          if (col.field === 'index') return row.index
          return row[col.field] || 0
        })
        .join(',')

      csvContent += rowData + '\r\n'
    })

    // Descargar archivo
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `REPORTE_PRODUCTOS_CADUCIDAD_${obtenerFechaActual()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error al exportar a Excel:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al exportar el reporte',
    })
  }
}

// Inicialización
onMounted(() => {
  cargarAlmacenes()

  fechaFinal.value = obtenerFechaActual()
})
</script>

<style scoped>
/* Estilos personalizados si son necesarios */
</style>
