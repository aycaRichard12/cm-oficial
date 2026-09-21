<template>
  <q-page class="q-pa-lg bg-fondo page-min-height">
    <CabeceraCotizacion />

    <q-card class="my-card q-mb-xl shadow-3 card-cotizacion">
      <q-card-section
        class="bg-primary text-white q-py-md q-px-lg flex justify-between items-center bg-primary-gradient"
      >
        <div class="flex items-center">
          <q-icon name="manage_accounts" size="sm" class="q-mr-sm" />
          <div class="text-subtitle1 text-weight-bold">Datos del Cliente y Configuración</div>
        </div>
        <div class="flex items-center bg-white text-primary q-px-sm q-py-xs shadow-2 radius-20">
          <q-icon name="inventory_2" size="xs" class="q-mr-xs" />
          <div class="text-caption text-weight-bold q-mr-sm">Venta sin stock</div>
          <q-btn
            :icon="permitirStock ? 'toggle_on' : 'toggle_off'"
            dense
            flat
            :color="permitirStock ? 'positive' : 'grey'"
            size="md"
            @click="permitirStockvacio"
            class="q-pa-none"
          />
        </div>
      </q-card-section>

      <DatosCliente
        :tipo-operacion="tipoOperacion"
        :option-operacion="optionOperacion"
        :fecha="fecha"
        :selected-client="selectedClient"
        :filtered-clients="filteredClients"
        :selected-sucursal="selectedSucursal"
        :filtered-sucursales="filteredSucursales"
        :canalventa="canalventa"
        :sales-channels="salesChannels"
        @update:tipoOperacion="tipoOperacion = $event"
        @update:fecha="fecha = $event"
        @update:selectedClient="selectedClient = $event"
        @update:selectedSucursal="selectedSucursal = $event"
        @update:canalventa="canalventa = $event"
        @tipo-operacion-change="handleTipoOperacionChange"
        @fecha-change="cambioFecha"
        @registrar-cliente="RegistrarCliente"
        @filter-client="filterClient"
        @set-client-input="setClientInputValue"
        @elegir-cliente="elegirUnCliente"
        @filter-sucursal="filterSucursal"
        @set-sucursal-input="setSucursalInputValue"
        @elegir-sucursal="elegirUnaSucursal"
      />

      <q-separator class="q-my-xl bg-grey-3" style="height: 2px" />

      <ConfiguracionInicial
        :filtroAlmacenCO="filtroAlmacenCO"
        :almacenesOptions="almacenesOptions"
        :filtroCategoriaCO="filtroCategoriaCO"
        :categoriasOptions="categoriasOptions"
        :puntoVenta="puntoVenta"
        :puntosVenta="puntosVenta"
        @update:filtroAlmacenCO="filtroAlmacenCO = $event"
        @update:filtroCategoriaCO="filtroCategoriaCO = $event"
        @update:puntoVenta="puntoVenta = $event"
        @almacen-change="listaCategoria"
        @categoria-change="listaProductosDisponibles"
      />
    </q-card>

    <q-card class="my-card q-mb-xl shadow-3 card-cotizacion">
      <q-card-section
        class="bg-secondary text-white q-py-md q-px-lg flex items-center bg-secondary-gradient"
      >
        <q-icon name="shopping_cart_checkout" size="sm" class="q-mr-sm" />
        <div class="text-subtitle1 text-weight-bold">Añadir Productos</div>
      </q-card-section>

      <q-card-section class="q-pa-lg bg-grey-1" style="border-bottom: 1px solid #e0e0e0">
        <AgregarProducto
          :esProductoUnico="esProductoUnico"
          :registrarComoProductoUnico="registrarComoProductoUnico"
          :selectedProduct="selectedProduct"
          :filteredProducts="filteredProducts"
          :cantidaddisponibleCO="cantidaddisponibleCO"
          :cantidadCO="cantidadCO"
          :precioCO="precioCO"
          :idproductoalmacenCO="idproductoalmacenCO"
          :canAddProduct="canAddProduct"
          :divisaActiva="divisaActiva"
          :permisosStore="permisosStore"
          @update:registrarComoProductoUnico="registrarComoProductoUnico = $event"
          @update:cantidadCO="cantidadCO = $event"
          @update:precioCO="precioCO = $event"
          @filter-product="filterProduct"
          @set-product-input="setProductInputValue"
          @elegir-producto="elegirUnProducto"
          @anadir-producto="anadirProductoACarrito"
          @guardar-codigos="guardarCodigosEnVenta"
        />
      </q-card-section>

      <ResumenCarrito
        :carrito="carritoCO"
        :divisa="divisaActiva"
        :es-producto-unico="esProductoUnico"
        @eliminar-producto="eliminarProductoCarrito"
        @recalcular-totales="calcularTotalesCarrito"
        @aplicar-descuento="aplicarDescuento"
        @update:descuento="carritoCO.descuento = $event"
        @update:descripcionAdicional="handleDescripcionAdicional"
      />

      <q-card-section class="bg-grey-2 q-pa-lg" style="border-top: 1px solid #e0e0e0">
        <div class="row justify-end items-center q-gutter-x-md">
          <q-btn
            flat
            color="negative"
            icon="close"
            label="Cancelar"
            @click="$emit('cancelarregistro')"
            class="q-px-md btn-rounded-100"
          />
          <q-btn
            outline
            color="primary"
            icon="edit_note"
            label="Firma del Cliente"
            @click="handleFirmaClick"
            class="q-px-lg bg-white btn-firma"
          />
          <q-btn
            label="Continuar"
            color="primary"
            icon="task_alt"
            size="lg"
            :disable="carritoCO.listaProductos.length === 0"
            @click="cotizacion_proforma"
            class="q-px-xl text-weight-bolder btn-continuar"
            :class="{ 'btn-continuar--enabled': carritoCO.listaProductos.length > 0 }"
          />
        </div>
      </q-card-section>
    </q-card>

    <DialogoPago
      :mostrar="modalmetodopago"
      @update:mostrar="modalmetodopago = $event"
      :carrito="carritoCO"
      :metodos-pagos="metodosPagos"
      :lista-caja-bancos="listaCajaBancos"
      :divisa-activa="divisaActiva"
      @update:idcajaBancoSeleccionada="idcajaBancoSeleccionada = $event"
      @confirmar-pago="enviarDatos"
    />

    <DialogoConfirmacion
      :mostrar="dialog"
      @update:mostrar="dialog = $event"
      @cancelar="cancelar"
      @confirmar="confirmar"
    />
    <DialogoPDF
      :mostrar="mostrarModal"
      @update:mostrar="mostrarModal = $event"
      :pdf-data="pdfData"
      :is-mobile="isMobile"
      :mobile-fallback-url="mobileFallbackUrl"
      @reiniciar="$emit('reiniciar')"
    />

    <q-dialog v-model="showAddModal">
      <MyRegistrationForm @recordCreated="handleRecordCreated" />
    </q-dialog>

    <ModalfirmaPage
      v-model="modalfirmaActivo"
      :id-entidad="selectedClient"
      tipo-operacion="CLIENTE"
      @onSuccess="alTerminarFirma"
      @onError="alFallarFirma"
    />
  </q-page>
</template>

<script setup>
import { ref, watch, onMounted, reactive } from 'vue'

// Importar Componentes Faltantes
import CabeceraCotizacion from '../components/CabeceraCotizacion.vue'
import DatosCliente from '../components/DatosCliente.vue'
import ConfiguracionInicial from '../components/ConfiguracionInicial.vue'
import AgregarProducto from '../components/AgregarProducto.vue'
import ResumenCarrito from '../components/ResumenCarrito.vue'
import DialogoPago from '../components/DialogoPago.vue'
import DialogoConfirmacion from '../components/DialogoConfirmacion.vue'
import DialogoPDF from '../components/DialogoPDF.vue'
import MyRegistrationForm from 'src/components/clientes/admin/modalClienteForm.vue'
import ModalfirmaPage from './ModalfirmaPage.vue'

import { useCarrito } from '../composables/useCarrito'
import { useCliente } from '../composables/useCliente'
import { useProducto } from '../composables/useProducto'
import { useCotizacion } from '../composables/useCotizacion'
import { useConfiguracion } from '../composables/useConfiguracion'
import { useOperacionesPermitidas } from 'src/composables/useAutorizarOperaciones'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { obtenerFechaActualDato, validarUsuario } from 'src/composables/FuncionesG'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const idempresa = idempresa_md5()
const permisosStore = useOperacionesPermitidas()
const fecha = ref(obtenerFechaActualDato())
const modalfirmaActivo = ref(false)
const tipoOperacion = ref({ value: 0, label: 'Cotización Normal' })
const optionOperacion = ref([
  { value: 0, label: 'Cotización Normal' },
  { value: 1, label: 'Cotización Preferencial' },
])
const filtroAlmacenCO = ref(null)
const filtroCategoriaCO = ref(null)
const puntoVenta = ref(null)
const permitirStock = ref(false)
const cotizacionFormRef = ref(null)
const formClientes = ref(null)
const idalmacenfiltro = ref(0)
const idporcentajeventa = ref(0)
const modalmetodopago = ref(false)
const idcajaBancoSeleccionada = ref(null) // Para usar con useCotizacion

const {
  almacenesOptions,
  categoriasOptions,
  puntosVenta,
  salesChannels,
  divisaActiva,
  soloAlmacen,
  metodosPagos,
  listaCajaBancos,
  cargarConfiguracionInicial,
  cargarAlmacenes,
  fetchEstadoActual,
  cargarPuntosVenta,
} = useConfiguracion()

const cliente = useCliente({
  soloAlmacen,
  almacenesOptions,
  salesChannels,
})
const {
  selectedClient,
  filteredClients,
  selectedSucursal,
  filteredSucursales,
  idclienteCO,
  idsucursalCOS,
  canalventa,
  showAddModal,

  filterClient,
  setClientInputValue,
  elegirUnCliente,
  filterSucursal,
  setSucursalInputValue,
  elegirUnaSucursal,
  RegistrarCliente,
  handleRecordCreated,
  cargarClientes,
} = cliente

const carritoCO = reactive({
  ventatotal: 0,
  subtotal: 0,
  descuento: 0,
  idalmacen: 0,
  divisa: 0,
  ipv: null,
  idusuario: 0,
  listaProductos: [],
  pagosDivididos: [{ metodoPago: null, monto: 0, porcentaje: 0 }],
  metodoPago: 0,
  variablePago: 'directo',
  fecha: '',
  credito: false,
  idfirma: null,
  codigosUnicos: [],
  cajabanco: null,
  cantidadPagos: 1,
  montoPagos: 0,
  periodo: 30,
  plazoPersonalizado: 0,
  fechaLimite: '',
})

const {
  selectedProduct,
  filteredProducts,
  cantidaddisponibleCO,
  cantidadCO,
  precioCO,
  idstockCO,
  idporcentajeCO,
  idproductoalmacenCO,
  esProductoUnico,
  registrarComoProductoUnico,
  CodigosUnicosSeleccionados,
  filterProduct,
  setProductInputValue,
  elegirUnProducto,
  resetProductoInputs,
  listaProductosDisponibles,
  guardarCodigosEnVenta,
} = useProducto({ idempresa, filtroCategoriaCO, carritoCO })

const {
  canAddProduct,
  anadirProductoACarrito,
  eliminarProductoCarrito,
  calcularTotalesCarrito,
  aplicarDescuento,
  resetCarrito,
} = useCarrito({
  divisa: divisaActiva,
  idempresa,
  tipoOperacion,
  permitirStock,
  filtroAlmacenCO,
  selectedProduct,
  cantidadCO,
  precioCO,
  idproductoalmacenCO,
  idstockCO,
  idporcentajeCO,
  cantidaddisponibleCO,
  CodigosUnicosSeleccionados,
  listaProductosDisponibles,
  resetProductoInputs,
  carritoExistente: carritoCO,
})

const cotizacion = useCotizacion({
  carritoCO,
  tipoOperacion,
  idclienteCO,
  idsucursalCOS,
  filtroAlmacenCO,
  filtroCategoriaCO,
  puntoVenta,
  idcajaBancoSeleccionada,
  almacenesOptions,
  cotizacionFormRef,
  formClientes,
  resetCarrito,
  cargarAlmacenes,
  cargarCLientes: cargarClientes,

  idempresa,
  onReset: () => emit('reiniciar'),
})
const {
  pdfData,
  mostrarModal,
  isMobile,
  mobileFallbackUrl,
  dialog,
  confirmar,
  cancelar,
  cotizacion_proforma,
  handleTipoOperacionChange,
  cambioFecha,
  alTerminarFirma,
  alFallarFirma,
  enviarDatos,
} = cotizacion

const listaCategoria = async () => {
  const user = await validarUsuario()
  const idempresa = user[0]?.empresa?.idempresa
  if (!idempresa) return

  // Limpiar selección de producto anterior al cambiar almacén
  resetProductoInputs()

  try {
    const response = await api.get(`listarCategoriaPrecioVenta/${idempresa}`)
    const resultado = response.data
    // La API puede devolver ['error', msg] o un array de categorías
    const isErrorArray = Array.isArray(resultado) && resultado[0] === 'error'
    if (isErrorArray) {
      console.error(resultado[1] ?? resultado.error)
      return
    }
    categoriasOptions.value = resultado.filter((u) => {
      return Number(u.estado) === 1 && Number(u.idalmacen) === Number(filtroAlmacenCO.value)
    })
    if (categoriasOptions.value.length > 0) {
      filtroCategoriaCO.value = categoriasOptions.value[0].id
    } else {
      filtroCategoriaCO.value = null
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error)
  }
}

const handleDescripcionAdicional = ({ id, value }) => {
  const producto = carritoCO.listaProductos.find((p) => p.idproductoalmacen === id)
  if (producto) {
    producto.descripcionAdicional = value
  }
}

watch(filtroAlmacenCO, async (newVal) => {
  idalmacenfiltro.value = newVal
  await cargarPuntosVenta(newVal)
  await listaCategoria()
  if (puntosVenta.value && puntosVenta.value.length > 0) {
    puntoVenta.value = puntosVenta.value[0].value
  }
})

watch(filtroCategoriaCO, async (newVal) => {
  idporcentajeventa.value = newVal
  await listaProductosDisponibles()
})

watch(selectedClient, (newVal) => {
  elegirUnCliente(newVal)
})

// Fix FECHA: sincronizar la fecha seleccionada con el carrito para que se
// envíe al backend en `listaProductos`. Con `immediate: true` se garantiza
// que la fecha por defecto (obtenerFechaActualDato) también se propague.
watch(
  fecha,
  (newVal) => {
    carritoCO.fecha = newVal
  },
  { immediate: true },
)

const permitirStockvacio = () => {
  permitirStock.value = !permitirStock.value
}

const $q = useQuasar()

const handleFirmaClick = () => {
  if (!selectedClient.value) {
    $q.notify({
      type: 'warning',
      message: 'Seleccione un cliente antes de firmar.',
    })
    return
  }
  modalfirmaActivo.value = true
}

onMounted(async () => {
  isMobile.value = window.innerWidth < 768
  await fetchEstadoActual()
  await cargarConfiguracionInicial()
  await permisosStore.cargarPermisos()
  await cargarClientes() // <--- agregado
  await cargarPuntosVenta()
  if (filtroAlmacenCO.value) {
    await listaCategoria()
  }
})

const emit = defineEmits(['reiniciar', 'cancelarregistro'])
</script>
