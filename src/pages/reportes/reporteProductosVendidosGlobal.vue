<template>
  <q-page>
    <q-card-section class="q-pa-md">
      <div class="titulo">Reporte de Productos Vendidos</div>
      <!-- Formulario de parámetros -->
      <q-form @submit.prevent="generarReporte">
        <div class="row flex justify-center q-col-gutter-x-md">
          <div class="col-12 col-md-4">
            <label for="fechaini">Fecha Inicial*</label>
            <q-input
              outlined
              dense
              v-model="fechaInicial"
              id="fechaini"
              :rules="[(val) => !!val || 'Campo obligatorio']"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaInicial" mask="YYYY-MM-DD" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-4">
            <label for="fechafin">Fecha Final*</label>
            <q-input
              outlined
              dense
              v-model="fechaFinal"
              id="fechafin"
              :rules="[
                (val) => !!val || 'Campo obligatorio',
                (val) => validarFechas(val) || 'Fecha final debe ser mayor o igual a la inicial',
              ]"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="fechaFinal" mask="YYYY-MM-DD" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>

        <div class="row justify-center q-mt-md">
          <q-btn label="Generar reporte" type="submit" color="primary" class="q-mr-sm" />
          <q-btn
            label="Exportar a Excel"
            color="primary"
            @click="exportarTablaAExcel"
            :disable="!datosFiltrados || datosFiltrados.length === 0"
          />
        </div>
      </q-form>

      <!-- Filtros -->
      <div class="row justify-center q-col-gutter-x-md q-mt-md">
        <div class="col-12 col-md-3">
          <label for="almacen">Filtrar por almacén</label>
          <q-select
            id="almacen"
            v-model="almacenSeleccionado"
            :options="almacenesOptions"
            outlined
            dense
            emit-value
            map-options
          />
        </div>
        <div class="col-12 col-md-3">
          <label for="cliente">Filtrar por razón social</label>
          <q-select
            id="cliente"
            v-model="clienteSeleccionado"
            :options="clientesOptions"
            option-label="label"
            option-value="value"
            use-input
            outlined
            dense
            emit-value
            map-options
            clearable
            @filter="filtrarClientes"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> Sin resultados </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="col-12 col-md-3">
          <label for="sucursal">Filtrar por sucursal</label>
          <q-select
            id="sucursal"
            v-model="sucursalSeleccionada"
            :options="sucursalesOptions"
            option-label="label"
            option-value="value"
            use-input
            outlined
            dense
            emit-value
            map-options
            @filter="filtrarSucursales"
            clearable
            :disable="!clienteSeleccionado"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> Sin resultados </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </div>

      <!-- Tabla de resultados -->
      <div class="q-mt-md">
        <q-table
          flat
          bordered
          title="Productos Vendidos"
          :rows="datosFiltrados"
          :columns="columnas"
          row-key="id"
          virtual-scroll
          style="max-height: calc(100vh - 265px)"
          :loading="cargando"
          no-data-label="No se Genero el Reporte"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="numero">{{ props.rowIndex + 1 }}</q-td>
              <q-td key="fecha">{{ formatearFecha(props.row.fecha) }}</q-td>
              <q-td key="nrofactura">{{ props.row.nrofactura }}</q-td>
              <q-td key="tipoventa">{{ tipoVenta[props.row.tipoventa] }}</q-td>
              <q-td key="codigo">{{ props.row.codigo }}</q-td>
              <q-td key="codigobarra">{{ props.row.codigobarra }}</q-td>
              <q-td key="descripcion">{{ props.row.descripcion }}</q-td>
              <q-td key="preciobase" class="text-right">{{ decimas(props.row.preciobase) }}</q-td>
              <q-td key="preciounitario" class="text-right">{{
                decimas(props.row.preciounitario)
              }}</q-td>
              <q-td key="cantidad" class="text-right">{{ props.row.cantidad }}</q-td>
              <q-td key="importe" class="text-right">{{
                decimas(redondear(parseFloat(props.row.importe)))
              }}</q-td>
              <q-td key="descuento" class="text-right">{{ props.row.descuento }}</q-td>
              <q-td key="totalcosto" class="text-right">{{
                decimas(redondear(parseFloat(props.row.totalcosto)))
              }}</q-td>
              <q-td key="totalventa" class="text-right">{{
                decimas(redondear(parseFloat(props.row.totalventa)))
              }}</q-td>
              <q-td key="utilidad" class="text-right">{{
                decimas(redondear(parseFloat(props.row.utilidad)))
              }}</q-td>
              <q-td key="tipopago">{{ props.row.tipopago }}</q-td>
              <q-td key="idusuario">{{ props.row.idusuario }}</q-td>
              <q-td key="sucursalc">{{ props.row.sucursalc }}</q-td>
              <q-td key="almacen">{{ props.row.almacen }}</q-td>
              <q-td key="cliente">{{ props.row.cliente }}</q-td>
              <q-td key="tipodocumento">{{ props.row.tipodocumento }}</q-td>
              <q-td key="nrodoc">{{ props.row.nrodoc }}</q-td>
              <q-td key="nombrecomercial">{{ props.row.nombrecomercial }}</q-td>
              <q-td key="unidad">{{ props.row.unidad }}</q-td>
              <q-td key="categoria">{{ props.row.categoria }}</q-td>
              <q-td key="subcategoria">{{ props.row.subcategoria }}</q-td>
              <q-td key="canal">{{ props.row.canal }}</q-td>
              <q-td key="tipoprecio">{{ props.row.tipoprecio }}</q-td>
            </q-tr>
          </template>

          <template v-slot:bottom-row>
            <q-tr>
              <q-td colspan="9" class="text-right">Sumatorias</q-td>
              <q-td class="text-right">{{ formatearNumero(sumatorias.cantidad) }}</q-td>
              <q-td class="text-right">{{ formatearNumero(sumatorias.importe) }}</q-td>
              <q-td class="text-right">{{ formatearNumero(sumatorias.descuento) }}</q-td>
              <q-td class="text-right">{{ formatearNumero(sumatorias.totalcosto) }}</q-td>
              <q-td class="text-right">{{ formatearNumero(sumatorias.totalventa) }}</q-td>
              <q-td colspan="13"></q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </q-card-section>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { date } from 'quasar'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { exportToXLSX_Reporte_Productos } from 'src/utils/XCLReportImport'
import { decimas, redondear } from 'src/composables/FuncionesG'
console.log(decimas(456), redondear(13))

const $q = useQuasar()
const tipoVenta = {
  4: 'Cotización',
  0: 'Comprobante Venta',
  1: 'Factura Compra-Venta',
  2: 'Factura Alquileres',
  3: 'Factura Comercial Exportación',
  24: 'Nota de Crédito-Débito',
}

// Estado reactivo
const fechaInicial = ref(date.formatDate(Date.now(), 'YYYY-MM-DD'))
const fechaFinal = ref(date.formatDate(Date.now(), 'YYYY-MM-DD'))
const cargando = ref(false)
const datosOriginales = ref([])
const datosFiltrados = ref([])
const almacenesOptions = ref([{ label: 'Todos los almacenes', value: 0 }])
const almacenSeleccionado = ref(0)
const clientesOptions = ref([])
const clientesOriginal = ref([])
const clienteSeleccionado = ref(null)
const sucursalesOptions = ref([])
const sucursalesOriginal = ref([])
const sucursalSeleccionada = ref(null)
const formularioExcel = ref([])

// Columnas de la tabla
const columnas = [
  { name: 'numero', label: 'N°', align: 'left', field: 'numero' },
  { name: 'fecha', label: 'Fecha', align: 'left', field: 'fecha' },
  { name: 'nrofactura', label: 'Nro. Doc.', align: 'left', field: 'nrofactura' },
  { name: 'tipoventa', label: 'Tipo de Venta', align: 'left', field: 'tipoventa' },
  { name: 'codigo', label: 'Código Producto', align: 'left', field: 'codigo' },
  { name: 'codigobarra', label: 'Código Barras', align: 'left', field: 'codigobarra' },
  {
    name: 'descripcion',
    label: 'Descripción de Producto',
    align: 'left',
    field: 'descripcion',
  },
  { name: 'preciobase', label: 'Costo Unitario', align: 'right', field: 'preciobase' },
  { name: 'preciounitario', label: 'Precio Unitario', align: 'right', field: 'preciounitario' },
  { name: 'cantidad', label: 'Cantidad', align: 'right', field: 'cantidad' },
  { name: 'importe', label: 'Importe', align: 'right', field: 'importe' },
  { name: 'descuento', label: 'Dscto.', align: 'right', field: 'descuento' },
  { name: 'totalcosto', label: 'Costo Total', align: 'right', field: 'totalcosto' },
  { name: 'totalventa', label: 'Venta Total', align: 'right', field: 'totalventa' },
  { name: 'utilidad', label: 'Utilidad', align: 'right', field: 'utilidad' },
  { name: 'tipopago', label: 'Tipo Pago', align: 'left', field: 'tipopago' },
  { name: 'idusuario', label: 'Nombre de Usuario', align: 'left', field: 'idusuario' },
  { name: 'sucursalc', label: 'Sucursal del Cliente', align: 'left', field: 'sucursalc' },
  { name: 'almacen', label: 'Almacén Empresa', align: 'left', field: 'almacen' },
  { name: 'cliente', label: 'Razón Social Empresa', align: 'left', field: 'cliente' },
  { name: 'tipodocumento', label: 'Tipo Documento', align: 'left', field: 'tipodocumento' },
  { name: 'nrodoc', label: 'Nro. Doc. Tributario', align: 'left', field: 'nrodoc' },
  {
    name: 'nombrecomercial',
    label: 'Nombre Comercial',
    align: 'left',
    field: 'nombrecomercial',
  },
  { name: 'unidad', label: 'Unidad', align: 'left', field: 'unidad' },
  { name: 'categoria', label: 'Categoría', align: 'left', field: 'categoria' },
  { name: 'subcategoria', label: 'Sub Categoría', align: 'left', field: 'subcategoria' },
  { name: 'canal', label: 'Canal', align: 'left', field: 'canal' },
  { name: 'tipoprecio', label: 'Tipo de Precio', align: 'left', field: 'tipoprecio' },
]

// Computed properties
const sumatorias = computed(() => {
  return datosFiltrados.value.reduce(
    (acc, item) => {
      acc.cantidad += parseFloat(item.cantidad) || 0
      acc.importe += parseFloat(item.importe) || 0
      acc.descuento += parseFloat(item.descuento) || 0
      acc.totalcosto += parseFloat(item.totalcosto) || 0
      acc.totalventa += parseFloat(item.totalventa) || 0
      return acc
    },
    { cantidad: 0, importe: 0, descuento: 0, totalcosto: 0, totalventa: 0 },
  )
})

// Métodos
const formatearFecha = (fecha) => {
  return date.formatDate(fecha, 'DD/MM/YYYY')
}

const formatearNumero = (numero) => {
  return parseFloat(numero || 0).toFixed(2)
}

const validarFechas = (fechaFin) => {
  if (!fechaInicial.value || !fechaFin) return true
  return date.getDateDiff(fechaFin, fechaInicial.value, 'days') >= 0
}

const cargarAlmacenes = async () => {
  try {
    const contenidousuario = validarUsuario()
    const idempresa = contenidousuario[0]?.empresa?.idempresa

    const response = await api.get(`listaAlmacen/${idempresa}`)
    console.log(response)
    if (response.data && Array.isArray(response.data)) {
      almacenesOptions.value = [
        { label: 'Todos los almacenes', value: 0 },
        ...response.data.map((almacen) => ({
          label: almacen.nombre,
          value: almacen.id,
        })),
      ]
    }
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la lista de almacenes',
    })
  }
}

const cargarClientes = async () => {
  try {
    const contenidousuario = validarUsuario()
    const idempresa = contenidousuario[0]?.empresa?.idempresa

    const response = await api.get(`listaCliente/${idempresa}`)
    if (response.data && Array.isArray(response.data)) {
      clientesOriginal.value = response.data.map((cliente) => ({
        label: `${cliente.codigo} - ${cliente.nombre} - ${cliente.nombrecomercial} - ${cliente.ciudad} - ${cliente.nit}`,
        value: cliente.id,
        raw: cliente,
      }))
      clientesOptions.value = [...clientesOriginal.value]
    }
  } catch (error) {
    console.error('Error al cargar clientes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la lista de clientes',
    })
  }
}

const filtrarClientes = (val, update) => {
  update(() => {
    if (val === '') {
      clientesOptions.value = clientesOriginal.value
    } else {
      const needle = val.toLowerCase()
      clientesOptions.value = clientesOriginal.value.filter(
        (v) => v.label.toLowerCase().indexOf(needle) > -1,
      )
    }
  })
}

const cargarSucursales = async (idCliente) => {
  try {
    if (!idCliente) {
      sucursalesOptions.value = []
      sucursalesOriginal.value = []
      return
    }

    const response = await api.get(`listaSucursal/${idCliente}`)
    if (response.data && Array.isArray(response.data)) {
      sucursalesOriginal.value = response.data.map((sucursal) => ({
        label: sucursal.nombre,
        value: sucursal.id,
        raw: sucursal,
      }))
      sucursalesOptions.value = [...sucursalesOriginal.value]

      if (response.data.length === 0) {
        $q.notify({
          type: 'info',
          message: 'No existen sucursales registradas del cliente seleccionado',
        })
      }
    }
  } catch (error) {
    console.error('Error al cargar sucursales:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la lista de sucursales',
    })
  }
}

const filtrarSucursales = (val, update) => {
  update(() => {
    if (val === '') {
      sucursalesOptions.value = sucursalesOriginal.value
    } else {
      const needle = val.toLowerCase()
      sucursalesOptions.value = sucursalesOriginal.value.filter(
        (v) => v.label.toLowerCase().indexOf(needle) > -1,
      )
    }
  })
}

const generarReporte = async () => {
  try {
    cargando.value = true
    const contenidousuario = validarUsuario()
    const idempresa = contenidousuario[0]?.empresa?.idempresa
    const point = `reporteventasporproductosglobal/${idempresa}/${fechaInicial.value}/${fechaFinal.value}`
    const response = await api.get(point)

    if (response.data && Array.isArray(response.data)) {
      datosOriginales.value = response.data.filter((item) => item.estado == 1)
      console.log(datosOriginales.value)
      datosFiltrados.value = [...datosOriginales.value]
      prepararDatosParaExcel()
      await cargarAlmacenes()
      await cargarClientes()
    } else {
      datosOriginales.value = []
      datosFiltrados.value = []
      $q.notify({
        type: 'info',
        message: 'No se encontraron datos para el rango de fechas seleccionado',
      })
    }
  } catch (error) {
    console.error('Error al generar reporte:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el reporte',
    })
  } finally {
    cargando.value = false
  }
}

const prepararDatosParaExcel = () => {
  formularioExcel.value = datosOriginales.value.map((item) => ({
    Fecha: formatearFecha(item.fecha),
    'Nro. Doc.': item.nrofactura,
    'Tipo de Venta': tipoVenta[item.tipoventa],
    'Código Producto': item.codigo,
    'Código Barras': item.codigobarra,
    'Descripción de Producto': item.descripcion,
    'Costo Unitario': formatearNumero(item.preciobase),
    'Precio Unitario': formatearNumero(item.preciounitario),
    Cantidad: formatearNumero(item.cantidad),
    Importe: formatearNumero(item.importe),
    Descuento: formatearNumero(item.descuento),
    'Costo Total': formatearNumero(item.totalcosto),
    'Venta Total': formatearNumero(item.totalventa),
    Utilidad: formatearNumero(item.utilidad),
    'Tipo Pago': item.tipopago,
    'Nombre Usuario': item.idusuario,
    'Sucursal del Cliente': item.sucursalc,
    'Almacén Empresa': item.almacen,
    'Razón Social Empresa': item.cliente,
    'Tipo Documento': item.tipodocumento,
    'Nro. Doc. Tributario': item.nrodoc,
    'Nombre Comercial': item.nombrecomercial,
    Unidad: item.unidad,
    Categoria: item.categoria,
    'Sub Categoria': item.subcategoria,
    Canal: item.canal,
    'Tipo de Precio': item.tipoprecio,
  }))
}

const exportarTablaAExcel = () => {
  exportToXLSX_Reporte_Productos(
    datosFiltrados.value,
    fechaInicial.value,
    fechaFinal.value,
    almacenSeleccionado,
    clienteSeleccionado,
    sucursalSeleccionada,
    almacenesOptions,
    clientesOptions,
    sucursalesOptions,
  )
}

const filtrarYOrdenarDatos = () => {
  let datosFiltradosTemp = [...datosOriginales.value]

  if (almacenSeleccionado.value && almacenSeleccionado.value !== 0) {
    datosFiltradosTemp = datosFiltradosTemp.filter(
      (item) => item.idalmacen == almacenSeleccionado.value,
    )
  }

  if (clienteSeleccionado.value) {
    datosFiltradosTemp = datosFiltradosTemp.filter(
      (item) => item.idclienteve == clienteSeleccionado.value,
    )
  }

  if (sucursalSeleccionada.value) {
    datosFiltradosTemp = datosFiltradosTemp.filter(
      (item) => item.idsucursalve == sucursalSeleccionada.value,
    )
  }

  datosFiltrados.value = datosFiltradosTemp
  prepararDatosParaExcel()
}

// Watchers
watch(almacenSeleccionado, filtrarYOrdenarDatos)
watch(clienteSeleccionado, (newVal) => {
  sucursalSeleccionada.value = null
  if (newVal) {
    cargarSucursales(newVal)
  } else {
    sucursalesOptions.value = []
  }
  filtrarYOrdenarDatos()
})
watch(sucursalSeleccionada, filtrarYOrdenarDatos)

// Inicialización
onMounted(() => {
  // cargarAlmacenes()
})
</script>

<style scoped>
/* Estilos personalizados si son necesarios */
.q-table__top {
  padding: 0;
}
</style>
