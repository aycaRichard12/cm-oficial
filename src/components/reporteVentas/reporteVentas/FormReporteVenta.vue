<template>
  <q-page>
    <div class="titulo">Reporte Ventas</div>
    <q-form @submit.prevent="onSubmit">
      <div class="row justify-center q-col-gutter-x-md q-ma-sm">
        <div class="col-12 col-md-3">
          <label for="fechaini">Fecha Inicial*</label>
          <q-input type="date" v-model="fechai" id="fechaini" dense outlined />
        </div>
        <div class="col-12 col-md-3">
          <label for="fechafin">Fecha Final*</label>
          <q-input type="date" v-model="fechaf" id="fechafin" dense outlined />
        </div>
      </div>

      <div class="row justify-center q-mt-md">
        <div class="">
          <q-btn label="Generar reporte" color="primary" type="submit" class="q-mr-sm" />
        </div>
      </div>
    </q-form>
    <div class="row flex justify-between q-ma-md">
      <q-btn icon="picture_as_pdf" label="Vista previa" color="red" outline @click="vistaPrevia" />
      <q-btn
        icon="mdi-microsoft-excel"
        label="Exportar Excel"
        color="green"
        outline
        @click="exportXLSX"
      />
    </div>
    <div class="row q-col-gutter-x-md q-ma-sm">
      <!-- <div class="col-12 col-md-2">
        <label for="almacen">Filtrar por Almacén</label>
        <q-select id="almacen" dense outlined v-model="almacen" :options="almacenes" clearable />
      </div> -->
      <!-- 
      <div class="col-12 col-md-3">
        <label for="cliente">Filtrar por razón social</label>
        <q-input
          v-model="clienteBusqueda"
          id="cliente"
          dense
          outlined
          @click="dialogClientes = true"
          readonly
          clearable
        >
          <template v-if="clienteSeleccionadoId" v-slot:append>
            <q-btn
              dense
              flat
              round
              icon="close"
              color="negative"
              size="sm"
              @click.stop="clearCliente"
            />
          </template>
        </q-input>
        <q-dialog v-model="dialogClientes">
          <q-card style="width: 80vw; max-width: 800px">
            <q-card-section class="row items-center">
              <q-input
                v-model="clienteFilter"
                label="Filtrar clientes..."
                dense
                class="col-grow"
                autofocus
              />
              <q-btn flat round icon="close" v-close-popup />
            </q-card-section>

            <q-card-section style="max-height: 70vh" class="scroll">
              <q-list bordered separator>
                <q-item
                  v-for="cliente in clientesFiltrados"
                  :key="cliente.value"
                  clickable
                  @click="selectCliente(cliente)"
                  :active="cliente.value === clienteSeleccionadoId"
                  active-class="bg-blue-1 text-primary"
                >
                  <q-item-section>
                    <q-item-label>{{ cliente.label }}</q-item-label>
                    <q-item-label caption>ID: {{ cliente.value }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>

      <div class="col-12 col-md-2">
        <label for="sucursal">Filtrar por sucursal del cliente</label>
        <q-input
          v-model="sucursalBusqueda"
          id="sucursal"
          dense
          outlined
          @click="dialogSucursal = true"
          readonly
          clearable
        >
          <template v-if="SucursalSelecionadoId" v-slot:append>
            <q-btn
              dense
              flat
              round
              icon="close"
              color="negative"
              size="sm"
              @click="clearSucursal"
              class="q-mr-xs"
            />
          </template>
        </q-input>
        <q-dialog v-model="dialogSucursal">
          <q-card style="width: 80vw; max-width: 800px">
            <q-card-section class="row items-center">
              <q-input
                v-model="sucursalFilter"
                label="Filtrar clientes..."
                dense
                class="col-grow"
                autofocus
              />
              <q-btn flat round icon="close" v-close-popup />
            </q-card-section>

            <q-card-section style="max-height: 70vh" class="scroll">
              <q-list bordered separator>
                <q-item
                  v-for="sucursal in sucursalesFilter"
                  :key="sucursal.value"
                  clickable
                  @click="selectSucursal(sucursal)"
                  :active="sucursal.value === sucursalFilter"
                  active-class="bg-blue-1 text-primary"
                >
                  <q-item-section>
                    <q-item-label>{{ sucursal.label }}</q-item-label>
                    <q-item-label caption>ID: {{ sucursal.value }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div> -->

      <!-- <div class="col-12 col-md-2">
        <label for="canal">Filtrar por canal de venta</label>
        <q-select id="canal" dense outlined="" v-model="canal" :options="canales" clearable />
      </div>

      <div class="col-12 col-md-3">
        <label for="tipopago">Filtrar por tipo de pago</label>
        <q-select
          id="tipopago"
          dense
          outlined=""
          v-model="tipopago"
          :options="[
            { label: 'todo', value: '0' },
            { label: 'A crédito', value: 'credito' },
            { label: 'Al contado', value: 'contado' },
          ]"
          clearable
        />
      </div> -->
    </div>
    <TableReporteVentas
      ref="refHijo"
      :rows="rows"
      @ver-detalle="verDetalle"
      @crear-mensaje="crearMensaje"
      @ir-a-factura="ir_a_factura"
      @ir-a-impuestos="ir_a_impuestos"
      @abrir-modal-nota="abrirModal"
    />

    <q-dialog v-model="mostrarModal" full-width full-height>
      <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Vista previa de PDF</div>
          <q-space />
          <q-btn flat round icon="close" @click="mostrarModal = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none" style="height: calc(100% - 60px)">
          <iframe
            v-if="pdfData"
            :src="pdfData"
            style="width: 100%; height: 100%; border: none"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>

    <RegistrarNotaCreditoDebito
      v-if="isVisibleNota"
      :venta="ventaSeleccionada"
      :key="formularioNota"
      @reiniciar="forzarReinicioCarrito"
    />
    {{ emailCliente }}
    <EnviarCorreoDialog
      v-model="dialogCorreo"
      :emailInicial="emailCliente"
      :opciones="opcionesEnvio"
      @ok="procesarEnvioCorreo"
      @cancel="() => {}"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import { PDFComprovanteVenta } from 'src/utils/pdfReportGenerator'
import { PDFreporteVentasPeriodo } from 'src/utils/pdfReportGenerator'
import { PDFenviarFacturaCorreo } from 'src/utils/pdfReportGenerator'
import { exportTOXLSX_Reporte_Ventas } from 'src/utils/XCLReportImport'
//import { getUsuario } from 'src/composables/FuncionesGenerales'
import RegistrarNotaCreditoDebito from 'src/pages/NotasCreditoDebito/RegistrarNotaCreditoDebito.vue'
import { primerDiaDelMes, cambiarFormatoFecha } from 'src/composables/FuncionesG'
import TableReporteVentas from './TableReporteVentas.vue'
import EnviarCorreoDialog from './EnviarCorreoDialog.vue'
import { getTipoFactura } from 'src/composables/FuncionesG'
const dialogCorreo = ref(false)

const emailCliente = ref('')
const opcionesEnvio = ref([])
let rowSeleccionado = null
//const usuario = getUsuario()
const resultadoFiltrado = ref([])

const isVisibleNota = ref(false)
const pdfData = ref(null)
const mostrarModal = ref(false)
// const tipo = {
//   0: 'Comprobante Venta',
//   1: 'Factura Compra-Venta',
//   2: 'Factura Alquileres',
//   3: 'Factura Comercial Exportación',
//   24: 'Nota de Crédito-Débido',
// }
const $q = useQuasar()
const today = new Date().toISOString().slice(0, 10)
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const tipo = {
  0: 'Comprobante Venta',
  1: 'Factura Compra-Venta',
  2: 'Factura Alquileres',
  3: 'Factura Comercial Exportación',
  24: 'Nota de Crédito-Débido',
}
console.log(primerDiaDelMes())
// Fec
const fechai = ref(primerDiaDelMes().toISOString().slice(0, 10))
const fechaf = ref(today)

// Filtros
const almacen = ref(null)
const sucursal = ref('')
const canal = ref(null)
const tipopago = ref('')

// Opciones select
// const almacenes = ref([])
// const canales = ref([])

// Autocompletado
// const dialogClientes = ref(false)
// const clienteBusqueda = ref('')
// const clienteFilter = ref('')
//const clienteSeleccionadoId = ref(null)
// const clientes = ref([])

// const dialogSucursal = ref(false)
// const sucursalBusqueda = ref('')
// const sucursalFilter = ref('')
//const SucursalSelecionadoId = ref(null)
//const sucursales = ref([])

const ventaSeleccionada = ref(null)
const formularioNota = ref(0)
const refHijo = ref(null)

const forzarReinicioCarrito = () => {
  ventaSeleccionada.value = null
  isVisibleNota.value = false // ⚠️ Esto reinicia el componente `carritoVenta`
}
// async function cargarAlmacenes() {
//   try {
//     const response = await api.get(`listaResponsableAlmacenReportes/${idempresa}`)
//     const filtrados = response.data.filter((obj) => obj.idusuario == idusuario)
//     almacenes.value = filtrados.map((item) => ({
//       label: item.almacen,
//       value: item.idalmacen,
//     }))
//   } catch (error) {
//     console.error('Error al cargar almacenes:', error)
//     $q.notify({ type: 'negative', message: 'No se pudieron cargar los proveedores' })
//   }
// }
// async function getSucursale() {
//   console.log(clienteSeleccionadoId.value)
//   try {
//     const response = await api.get(`listaSucursal/${clienteSeleccionadoId.value}`)
//     sucursales.value = response.data.map((cli) => ({
//       value: cli.id,
//       label: `${cli.nombre}`,
//     }))
//   } catch (error) {
//     $q.notify({ type: 'negative', message: 'No se pudieron cargar los clientes' + error })
//   }
// }
// async function getClientes() {
//   try {
//     const response = await api.get(`listaCliente/${idempresa}`)
//     clientes.value = response.data.map((cli) => ({
//       value: cli.id,
//       label: `${cli.codigo} - ${cli.nombre} - ${cli.nombrecomercial} - ${cli.ciudad} - ${cli.nit}`,
//     }))
//   } catch (error) {
//     $q.notify({ type: 'negative', message: 'No se pudieron cargar los clientes' + error })
//   }
// }
// async function getCanalVenta() {
//   try {
//     const response = await api.get(`listaCanalVenta/${idempresa}`)
//     canales.value = response.data.map((cli) => ({
//       value: cli.id,
//       label: `${cli.canal}`,
//     }))
//   } catch (error) {
//     $q.notify({ type: 'negative', message: 'No se pudieron cargar los clientes' + error })
//   }
// }
// const clientesFiltrados = computed(() => {
//   if (!clienteFilter.value) return clientes.value
//   const search = clienteFilter.value.toLowerCase()
//   return clientes.value.filter((c) => c.label.toLowerCase().includes(search))
// })

// const selectCliente = (cliente) => {
//   clienteSeleccionadoId.value = cliente.value
//   clienteBusqueda.value = cliente.label
//   dialogClientes.value = false
//   getSucursale()
//   clearSucursal()
// }

// const clearCliente = () => {
//   clienteSeleccionadoId.value = null
//   clienteBusqueda.value = ''
//   clearSucursal()
// }

// const sucursalesFilter = computed(() => {
//   if (!sucursalFilter.value) return sucursales.value
//   const search = sucursalFilter.value.toLowerCase()
//   return sucursales.value.filter((c) => c.label.toLowerCase().includes(search))
// })

// const selectSucursal = (sucursal) => {
//   SucursalSelecionadoId.value = sucursal.value
//   sucursalBusqueda.value = sucursal.label
//   dialogSucursal.value = false
// }

// const clearSucursal = () => {
//   SucursalSelecionadoId.value = null
//   sucursalBusqueda.value = ''
// }

// Datos de la tabla
// DEFINICIÓN DE COLUMNAS ACTUALIZADA CON DATATYPE

const rows = ref([])
const detalleVenta = ref([])

const ir_a_factura = (row) => {
  console.log(row)
  window.open(row.shortlink, '_blank')
}
const ir_a_impuestos = (row) => {
  console.log(row)
  window.open(row.urlsin, '_blank')
}
// Acciones
const verDetalle = async (row) => {
  console.log(row)
  await getDetalleVenta(row.idventa)
  if (detalleVenta.value) {
    console.log(detalleVenta.value)
    imprimirReporte()
  } else {
    $q.notify({
      type: 'negative',
      message: 'Venta sin items',
    })
  }
}

// const crearMensaje = async (row) => {
//   console.log(row)
//   try {
//     const response = await api.get(`obtenerEmailCliente/${row.idcliente}`) // Cambia a tu ruta real
//     const clientEmail = response.data.email
//     let opciones = [{ label: 'Comprobante', value: 'comprobante' }]

//     if (Number(row.tipoventa) !== 0) {
//       opciones.push({ label: 'Factura', value: 'factura' })
//     }
//     $q.dialog({
//       title: 'Seleccione una opción',
//       message: `¿Qué desea enviar al correo "${clientEmail}"?`,
//       options: {
//         type: 'radio',
//         model: null,
//         items: opciones,
//       },
//       cancel: true,
//       persistent: true,
//     })
//       .onOk(async (opcion) => {
//         if (opcion === 'cancelar' || opcion === null) {
//           $q.notify({ type: 'info', message: 'Operación cancelada' })
//           return
//         }

//         console.log(`Elegiste: ${opcion}`)

//         await getDetalleVenta(row.idventa)

//         if (!detalleVenta.value) {
//           $q.notify({
//             type: 'negative',
//             message: 'Venta sin items',
//           })
//           return
//         }

//         if (opcion === 'comprobante') {
//           enviarComprobanteCorreo(row.idcliente)
//         }

//         if (opcion === 'factura') {
//           enviarFacturaCorreo(row.idcliente, row.shortlink)
//         }
//       })
//       .onCancel(() => {
//         $q.notify({ type: 'info', message: 'Operación cancelada' })
//       })
//   } catch (error) {
//     console.error('Error al cargar datos:', error)
//     $q.notify({
//       type: 'negative',
//       message: 'No se pudieron cargar los datos',
//     })
//   }
// }
// const crearMensaje = async (row) => {
//   try {
//     const response = await api.get(`obtenerEmailCliente/${row.idcliente}`)
//     let clientEmail = response.data.email ?? ''

//     let opciones = [{ label: 'Comprobante', value: 'comprobante' }]

//     if (Number(row.tipoventa) !== 0) {
//       opciones.push({ label: 'Factura', value: 'factura' })
//     }

//     $q.dialog({
//       title: 'Enviar documento',
//       message: `
//         <q-input v-model="email" filled type="email"
//           label="Correo del cliente"
//           placeholder="Ingrese el correo"
//           :rules="[val => !!val || 'El correo es obligatorio']"
//         />
//       `,
//       html: true,
//       options: {
//         type: 'radio',
//         model: null,
//         items: opciones,
//       },
//       cancel: true,
//       persistent: true,
//       component: {
//         data() {
//           return { email: clientEmail }
//         },
//       },
//     }).onOk(async (opcion, dialogRef) => {
//       const correoIngresado = dialogRef.scope.email

//       if (!correoIngresado || correoIngresado.trim() === '') {
//         return $q.notify({
//           type: 'warning',
//           message: 'Debe ingresar un correo válido',
//         })
//       }

//       await getDetalleVenta(row.idVenta)

//       if (!detalleVenta.value) {
//         return $q.notify({
//           type: 'negative',
//           message: 'Venta sin items',
//         })
//       }

//       if (opcion === 'comprobante') {
//         enviarComprobanteCorreo(row.idcliente, correoIngresado)
//       }

//       if (opcion === 'factura') {
//         enviarFacturaCorreo(row.idcliente, row.shortlink, correoIngresado)
//       }
//     })
//   } catch (error) {
//     console.error(error)
//     $q.notify({ type: 'negative', message: 'No se pudo cargar datos' })
//   }
// }
const crearMensaje = async (row) => {
  try {
    // 1. Limpia el valor antes de la llamada a la API (opcional, pero buena práctica)
    emailCliente.value = ''

    // 2. Guardar la fila seleccionada
    rowSeleccionado = row

    // 3. Obtener correo del cliente
    const response = await api.get(`obtenerEmailCliente/${row.idcliente}`)
    // Aquí actualizas el valor que será pasado como prop al diálogo
    emailCliente.value = response.data.email ?? ''
    console.log('Correo del cliente:', emailCliente.value)

    // 4. Configurar opciones
    opcionesEnvio.value = [{ label: 'Comprobante', value: 'comprobante' }]
    const tipoFactura = getTipoFactura(true) // Esta línea no afecta la funcionalidad de envío
    console.log('Tipo de factura:', tipoFactura)
    if (Number(row.tipoventa) !== 0) {
      opcionesEnvio.value.push({ label: 'Factura', value: 'factura' })
    }
    console.log('Opciones de envío:', opcionesEnvio.value)

    // 5. Abrir el modal
    dialogCorreo.value = true
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'No se pudo obtener los datos del cliente.' + error,
    })
  }
}
const procesarEnvioCorreo = async ({ correo, opcion }) => {
  const row = rowSeleccionado

  await getDetalleVenta(row.idventa)

  if (!detalleVenta.value) {
    return $q.notify({
      type: 'negative',
      message: 'Venta sin items',
    })
  }

  if (opcion === 'comprobante') {
    enviarComprobanteCorreo(row.idcliente, correo)
  }

  if (opcion === 'factura') {
    enviarFacturaCorreo(row.idcliente, correo, row.shortlink)
  }
}

async function enviarComprobanteCorreo(idcliente, correo) {
  console.log(detalleVenta.value)
  PDFenviarFacturaCorreo(idcliente, detalleVenta, $q, null, correo)
}

async function enviarFacturaCorreo(idcliente, shortlink, correo) {
  console.log(detalleVenta.value)

  PDFenviarFacturaCorreo(idcliente, detalleVenta, $q, shortlink, correo)
}
const getDetalleVenta = async (id) => {
  try {
    const response = await api.get(`detallesVenta/${id}/${idempresa}`) // Cambia a tu ruta real
    console.log(response.data)
    detalleVenta.value = response.data
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}

function imprimirReporte() {
  console.log(detalleVenta.value)
  const doc = PDFComprovanteVenta(detalleVenta)

  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
const vistaPrevia = () => {
  resultadoFiltrado.value = refHijo.value.obtenerDatos()
  const filterReporte = refHijo.value.getActiveFiltersReport()
  console.log('Filtros activos en el reporte:', filterReporte)
  const almacen = {
    label: filterReporte.almacen,
    value: 0,
  }
  const doc = PDFreporteVentasPeriodo(resultadoFiltrado, almacen)

  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
}
const exportXLSX = () => {
  resultadoFiltrado.value = refHijo.value.obtenerDatos()

  exportTOXLSX_Reporte_Ventas(resultadoFiltrado, almacen, fechai, fechaf)
}
const onSubmit = async () => {
  console.log('Generar reporte con filtros:', {
    fechai: fechai.value,
    fechaf: fechaf.value,
    sucursal: sucursal.value,
    canal: canal.value,
    almacen: almacen.value,
    tipopago: tipopago.value,
  })
  try {
    const response = await api.get(`reporteventas/${idusuario}/${fechai.value}/${fechaf.value}`) // Cambia a tu ruta real
    const datos = response.data
    console.log(datos)
    const filtrados = datos.filter((obj) => Number(obj.estado) == 1)
    rows.value = filtrados.map((obj, index) => ({
      cliente: obj.cliente,
      tipoventa: tipo[Number(obj.tipoventa)],
      tv: Number(obj.tipoventa),
      tipopago: obj.tipopago,
      nfactura: obj.nfactura,
      canal: obj.canal,
      total: Number(obj.descuento) + Number(obj.ventatotal),
      descuento: Number(obj.descuento),
      ventatotal: Number(obj.ventatotal),
      idventa: Number(obj.idventa),
      fecha: cambiarFormatoFecha(obj.fecha),
      idalmacen: obj.idalmacen,
      idcliente: obj.idcliente,
      divisa: obj.divisa,
      sucursal: obj.sucursal,
      estado: obj.estado,
      shortlink: obj.shortlink,
      urlsin: obj.urlsin,
      idcanal: obj.idcanal,
      idsucursal: obj.idsucursal,
      almacen: obj.almacen,
      nro: index + 1,
    }))
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
// const processedRows = computed(() => {
//   return rows.value.map((row, index) => ({
//     ...row,
//     nro: index + 1,
//     total: redondear(parseFloat(row.ventatotal) + parseFloat(row.descuento)),
//   }))
// })
// const filteredCompra = computed(() => {
//   return processedRows.value.filter((compra) => {
//     console.log(canal.value, tipopago.value)
//     const porAlmacen = !almacen.value || compra.idalmacen == almacen.value.value
//     const porCliente =
//       !clienteSeleccionadoId.value || compra.idcliente == clienteSeleccionadoId.value
//     const porSucursal =
//       !SucursalSelecionadoId.value || compra.idsucursal == SucursalSelecionadoId.value
//     const porCanal = !canal.value || compra.idcanal == canal.value?.value
//     const porTipoPago = !tipopago.value || compra.tipopago == tipopago.value?.value

//     return porAlmacen && porCliente && porSucursal && porCanal && porTipoPago
//   })
// })
function abrirModal(venta) {
  formularioNota.value++
  ventaSeleccionada.value = null // Esto reinicia el componente `carritoVenta`
  isVisibleNota.value = true
  ventaSeleccionada.value = venta
}

onMounted(() => {
  //cargarAlmacenes()
  //getClientes()
  //getCanalVenta()
})
</script>
