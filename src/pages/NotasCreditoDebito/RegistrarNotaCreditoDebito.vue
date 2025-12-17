<template>
  <div v-if="VisibleModalJustificacion">
    <q-dialog v-model="VisibleModalJustificacion" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white text-h6">
          Motivo de la Devolución
        </q-card-section>

        <q-card-section>
          <label for="motivo">Escriba el motivo...</label>
          <q-input v-model="motivo" type="textarea" outlined dense autogrow id="motivo" />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" @click="cancelarJustificacion" />
          <q-btn
            flat
            label="Continuar"
            color="primary"
            :disable="!motivo"
            @click="confirmarJustificacion"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
  <div v-else>
    <q-dialog v-model="VisibleModalNotaCredito" full-width full-height>
      <q-card>
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div>Registrar Nota Credito Debito</div>
          <q-btn icon="close" flat dense round @click="toggleModal" />
        </q-card-section>
        <q-card-section style="max-height: 83vh; overflow-y: auto">
          <FormNotaCreditoDebito :nota="Factura" @cancelar="toggleModal" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import { api } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import FormNotaCreditoDebito from 'src/components/reporteVentas/reporteVentas/FormNotaCreditoDebito.vue'
import { getUsuario } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
const props = defineProps({
  venta: {
    type: Object,
    required: true,
    // El valor por defecto ayuda a evitar errores durante el desarrollo si el prop no se pasa
    default: () => ({}),
  },
})
const venta = ref(props.venta)
const $q = useQuasar()
const VisibleModalNotaCredito = ref(false)
const VisibleModalJustificacion = ref(false)
const motivo = ref('')
const usuario = getUsuario()
const Factura = ref({})
const detalleVenta = ref([])
const idempresa = idempresa_md5()
const emit = defineEmits(['reiniciar', 'volver'])

const ir_a_NotaCreditoDebito = async (factura) => {
  console.log(factura)
  let jsonEmizor = {}
  try {
    const response = await api.get(`detallesVenta/${factura.idventa}/${idempresa}`) // Cambia a tu ruta real
    const venta = response.data[0]
    console.log(venta)
    detalleVenta.value = response.data[0]
    const productos = cambiarDetalleProducto(detalleVenta.value.detalle)
    jsonEmizor = {
      facturaExterna: {
        facturaExterna: 0,
        numeroFactura: Number(venta.nfactura),
        numeroAutorizacionCuf: venta.cuf,
        fechaFacturaOriginal: venta.fechaEmission,
        descuentoFacturaOriginal: parseFloat(venta.descuento),
        montoTotalFacturaOriginal: parseFloat(venta.montototal),
        detalleFacturaOriginal: productos.original,
      },
      idalmacen: factura.idalmacen,
      numeroNota: 1,
      codigoPuntoVenta: 0,
      nombreRazonSocial: venta.nombrecomercial,
      codigoTipoDocumentoIdentidad: Number(venta.tipodocumento),
      numeroDocumento: venta.nit,
      codigoCliente: venta.codigoCliente,
      codigoLeyenda: venta.leyendaSin,
      usuario: usuario,
      montoTotalDevuelto: 0,
      montoDescuentoCreditoDebito: 0,
      montoEfectivoCreditoDebito: 0,
      detalles: productos.ajuste,
      motivo: motivo.value,
      venta: venta,
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
  console.log(jsonEmizor)
  Factura.value = jsonEmizor
  VisibleModalNotaCredito.value = true
}
const cambiarDetalleProducto = (detalle = []) => {
  if (!Array.isArray(detalle) || detalle.length === 0) {
    return { original: [], ajuste: [] }
  }

  const productos = detalle[0] || []

  const original = []
  const ajuste = []

  productos.forEach((producto) => {
    original.push({
      codigoProducto: producto.codigo,
      codigoProductoSin: producto.codigosin,
      descripcion: producto.descripcion,
      cantidad: producto.cantidad,
      unidadMedida: producto.unidadsin,
      precioUnitario: parseFloat(producto.precio),
      subTotal: producto.subTotal,
      montoDescuento: 0,
    })

    ajuste.push({
      id: producto.idproducto,
      codigoProducto: producto.codigo,
      codigoActividadSin: producto.actividadsin,
      codigoProductoSin: producto.codigosin,
      descripcion: producto.descripcion,
      cantidad: Number(producto.cantidad),
      unidadMedida: producto.unidadsin,
      precioUnitario: parseFloat(producto.precio),
      subTotal: producto.subTotal,
      montoDescuento: 0,
      esPerdida: false,
      cantidadPerdida: 0,
    })
  })

  return { original, ajuste }
}
const ModalJustificacion = () => {
  VisibleModalJustificacion.value = true
}

const toggleModal = () => {
  VisibleModalNotaCredito.value = !VisibleModalNotaCredito.value
  console.log(VisibleModalNotaCredito.value)
}

const cancelarJustificacion = () => {
  VisibleModalJustificacion.value = false
  motivo.value = ''
  Factura.value = {} // resetea dato
  venta.value = null
  emit['reiniciar']
}
const confirmarJustificacion = () => {
  VisibleModalJustificacion.value = false
  ir_a_NotaCreditoDebito(venta.value)
}
watch(
  () => props.venta,
  (nuevaVenta) => {
    if (nuevaVenta && Object.keys(nuevaVenta).length > 0) {
      // reset antes de cargar
      motivo.value = ''
      Factura.value = {}
      VisibleModalNotaCredito.value = false
      VisibleModalJustificacion.value = false
      ModalJustificacion()
    }
  },
  { immediate: true },
)
</script>
