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
        :modalfirma-activo="modalfirmaActivo"
        @update:tipoOperacion="tipoOperacion = $event"
        @update:fecha="fecha = $event"
        @update:selectedClient="selectedClient = $event"
        @update:selectedSucursal="selectedSucursal = $event"
        @update:canalventa="canalventa = $event"
        @update:modalfirmaActivo="modalfirmaActivo = $event"
        @tipo-operacion-change="handleTipoOperacionChange"
        @fecha-change="cambioFecha"
        @registrar-cliente="RegistrarCliente"
        @filter-client="filterClient"
        @set-client-input="setClientInputValue"
        @elegir-cliente="elegirUnCliente"
        @filter-sucursal="filterSucursal"
        @set-sucursal-input="setSucursalInputValue"
        @elegir-sucursal="elegirUnaSucursal"
        @on-success-firma="alTerminarFirma"
        @on-error-firma="alFallarFirma"
      />

      <q-separator class="q-my-xl bg-grey-3" style="height: 2px" />

      <ConfiguracionInicial
        :filtro-almacen="filtroAlmacenCO"
        :almacenes-options="almacenesOptions"
        :filtro-categoria="filtroCategoriaCO"
        :categorias-options="categoriasOptions"
        :punto-venta="puntoVenta"
        :puntos-venta="puntosVenta"
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
          :es-producto-unico="esProductoUnico"
          :registrar-como-producto-unico="registrarComoProductoUnico"
          :selected-product="selectedProduct"
          :filtered-products="filteredProducts"
          :cantidad-disponible="cantidaddisponibleCO"
          :cantidad="cantidadCO"
          :precio="precioCO"
          :id-producto-almacen="idproductoalmacenCO"
          :can-add-product="canAddProduct"
          :divisa-activa="divisaActiva"
          :permisos-store="permisosStore"
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
            @click="RegistrarFirma"
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
      :remaining-amount="remainingAmount"
      @tipo-pago-change="handleTipoPagoGeneralChange"
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
  </q-page>
</template>
<script setup>
import { ref, watch, onMounted, reactive } from 'vue'
import { useCarrito } from '../composables/useCarrito'
import { useCliente } from '../composables/useCliente'
import { useProducto } from '../composables/useProducto'
import { useCotizacion } from '../composables/useCotizacion'
import { usePago } from '../composables/usePago'
import { useConfiguracion } from '../composables/useConfiguracion'
import { useOperacionesPermitidas } from 'src/composables/useAutorizarOperaciones'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { obtenerFechaActualDato } from 'src/composables/FuncionesG'
import MyRegistrationForm from 'src/components/clientes/admin/modalClienteForm.vue'
import { validarUsuario } from 'src/composables/FuncionesG'
import { api } from 'src/boot/axios'
// 2. Definir refs locales
const idempresa = idempresa_md5()
const permisosStore = useOperacionesPermitidas()
const fecha = ref(obtenerFechaActualDato())
const showAddModal = ref(false)
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

// 3. Inicializar useConfiguracion (ahora existe)
const {
  almacenesOptions,
  categoriasOptions,
  puntosVenta,
  salesChannels,
  divisaActiva,
  soloAlmacen,
  cargarConfiguracionInicial,
  cargarAlmacenes,
  fetchEstadoActual,
} = useConfiguracion()

// 4. Inicializar useCliente pasando dependencias
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
  divisa: 0, // se actualizará después
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
// 5. Inicializar useProducto (carritoCO ya está definido arriba)
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

// 6. Inicializar useCarrito pasando el carritoCO ya definido
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
  carritoExistente: carritoCO, // reutiliza el reactive ya definido
})

// 9. Inicializar usePago
const pago = usePago(carritoCO)
const { idcajaBancoSeleccionada, remainingAmount, handleTipoPagoGeneralChange } = pago

// 10. Inicializar useCotizacion
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
  RegistrarFirma,
  alTerminarFirma,
  alFallarFirma,
} = cotizacion

// 11. Definir funciones locales que llaman a las de los composables
const listaCategoria = async () => {
  // Esta función debería cargar las categorías según el almacén seleccionado.
  // Podemos usar una función de useConfiguracion o implementarla aquí.
  // Como useConfiguracion no tiene listaCategoria, la implementamos localmente.
  const user = await validarUsuario()
  const idempresa = user[0]?.empresa?.idempresa
  if (!idempresa) return
  try {
    const response = await api.get(`listarCategoriaPrecioVenta/${idempresa}`)
    const resultado = response.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
    } else {
      categoriasOptions.value = resultado.filter((u) => {
        return Number(u.estado) === 1 && Number(u.idalmacen) === Number(filtroAlmacenCO.value)
      })
      if (categoriasOptions.value.length > 0) {
        filtroCategoriaCO.value = categoriasOptions.value[0].id
      } else {
        filtroCategoriaCO.value = null
      }
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error)
  }
}

// 12. Watchers
watch(filtroAlmacenCO, (newVal) => {
  idalmacenfiltro.value = newVal
  listaCategoria()
})

watch(filtroCategoriaCO, (newVal) => {
  idporcentajeventa.value = newVal
  listaProductosDisponibles()
})

// 13. Ciclo de vida
onMounted(async () => {
  isMobile.value = window.innerWidth < 768
  await fetchEstadoActual()
  await cargarConfiguracionInicial()
  await permisosStore.cargarPermisos()
  // Cargar categorías después de tener almacenes
  if (filtroAlmacenCO.value) {
    await listaCategoria()
  }
})

// 14. Emit
const emit = defineEmits(['reiniciar', 'cancelarregistro'])
</script>
