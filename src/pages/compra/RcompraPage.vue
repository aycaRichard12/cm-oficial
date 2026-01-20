<template>
  <q-page padding>
    <div class="titulo">Registrar Compras</div>
    <q-dialog v-model="showForm" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary flex justify-between text-h6 text-white">
          <div>Registrar Compra</div>
          <q-btn color="white" icon="close" @click="cerrarFormulario" flat round dense />
        </q-card-section>
        <q-card-section>
          <form-compra
            :modalValue="registroActual"
            :almacenes="almacenes"
            :proveedores="proveedores"
            @submit="guardarRegistro"
            @cancel="cerrarFormulario"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <table-compra
      :rows="compras"
      :almacenes="almacenes"
      :almacenSeleccionado="almacenSeleccionado"
      @detalleCompra="verDetalle"
      @add="toggleForm"
      @edit="editarCompra"
      @delete="eliminarCompra"
      @actualizarTablaPrincipal="iniciar"
      @repDesglosado="generarReporteDesglosado"
      @repCompras="generarReporteGeneral"
      @toggle-status="autorizarCompra"
    />

    <q-dialog v-model="mostrarDetalleCompra" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-h6 text-white flex justify-between">
          <div>Detalle Compra</div>
          <q-btn icon="close" @click="mostrarDetalleCompra = false" flat dense round />
        </q-card-section>
        <q-card-section>
          <DetalleCompra
            :compra="formularioDetalleCompra"
            @close="cancelarDetalle"
            @update="iniciar"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showFormEdit" persistent>
      <q-card class="q-pa-md" style="width: 1200px; max-width: 90vw">
        <FormCompraEditar
          :modalValue="registroActual"
          :proveedores="proveedores"
          :editing="isEditing"
          @submit="guardarRegistro"
          @cancel="cerrarFormulario"
        />
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { api } from 'boot/axios'
import { idempresa_md5, idusuario_md5, objectToFormData } from 'src/composables/FuncionesGenerales'
import { useQuasar } from 'quasar'
import FormCompra from 'src/components/compra/FormCompra.vue'
import FormCompraEditar from 'src/components/compra/EditarCompra.vue'
import TableCompra from 'src/components/compra/TableCompra.vue'
import DetalleCompra from 'src/components/compra/DetalleCompra.vue'
import { useCompraStore } from 'src/stores/compras'

const compraStore = useCompraStore()

const $q = useQuasar()
const idempresa = idempresa_md5()
const idusuario = idusuario_md5()
const almacenSeleccionado = ref(null)
const showForm = ref(false)
const isEditing = ref(false)
const almacenes = ref([])
const proveedores = ref([])
const compras = ref([])
const mostrarDetalleCompra = ref(false)
const registroActual = ref({
  ver: 'registrarCompra',
  idusuario: idusuario,
  factura: compras.value.length,
  codigo: generarCodigo(),
  nombre: 'CMP-',
  tipoRegistro: 2,
})
const showFormEdit = ref(false)
const formularioDetalleCompra = ref({ ver: 'registrarDetalleCompra' })
const detalleCompra = ref([])
const productosDisponibles = ref([])
async function editarCompra(compra) {
  console.log(compra)
  registroActual.value = {
    ver: 'editarCompra',
    id: compra.id,
    nombre: compra.lote,
    codigo: compra.codigo,
    proveedor: compra.idproveedor,
    factura: compra.nfactura,
  }
  showFormEdit.value = true
}
async function eliminarCompra(compra) {
  console.log(compra)
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar Compra?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarCompra/${compra.id}`) // Cambia a tu ruta real
      console.log(response)
      if (response.data.estado === 'exito') {
        loadRows()
        $q.notify({
          type: 'positive',
          message: response.data.mensaje,
        })
      } else {
        $q.notify({
          type: 'negative',
          message: response.data.mensaje,
        })
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      $q.notify({
        type: 'negative',
        message: 'No se pudieron cargar los datos',
      })
    }
  })
}
async function enviarFormData(endpoint, data, mensajeExito, mensajeError) {
  try {
    const formData = objectToFormData(data)
    for (let [k, v] of formData.entries()) {
      console.log(`${k}: ${v}`)
    }
    console.log(endpoint, formData)
    console.log(data)
    const response = await api.post('', formData)
    console.log(response.data)
    if (response.data.estado === 'exito') {
      $q.notify({ type: 'positive', message: response.data.mensaje || mensajeExito })
      almacenSeleccionado.value = almacenes.value.find((almacen) => almacen.value === data.almacen)
      console.log(almacenSeleccionado.value)
      //iniciar()

      return response
    } else {
      $q.notify({ type: 'negative', message: response.data.mensaje || mensajeError })
    }
  } catch (error) {
    console.error('Error en API:', error)
    $q.notify({ type: 'negative', message: 'Error en la solicitud al servidor' + error })
  }
}

async function guardarRegistro(data) {
  const endpoint = isEditing.value ? 'editarCompra' : 'nuevaCompra'
  const response = await enviarFormData(
    endpoint,
    data,
    'Compra registrada correctamente',
    'Hubo un problema al registrar la compra',
  )
  if (response?.data?.estado === 'exito') {
    console.log('Compra guardada con éxito')
    await loadRows()
    showForm.value = false
    showFormEdit.value = false
    resetForm()
  }
}

function cerrarFormulario() {
  showForm.value = false
  isEditing.value = false
  showFormEdit.value = false
  compraStore.eliminarCompra()
  resetForm()
}

function resetForm() {
  registroActual.value = {
    ver: 'registrarCompra',
    idusuario: idusuario,
    factura: compras.value.length,
    codigo: generarCodigo(),
    nombre: 'CMP-',
    tipoRegistro: 2,
  }
  console.log('Formulario reseteado', registroActual.value)
}

async function cargarProveedores() {
  try {
    const response = await api.get(`listaProveedor/${idempresa}`)
    proveedores.value = response.data.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
  } catch (error) {
    console.error('Error al cargar proveedores:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los proveedores' })
  }
}

async function cargarAlmacenes() {
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`)
    const filtrados = response.data.filter((item) => item.idusuario == idusuario)
    almacenes.value = filtrados.map((item) => ({
      label: item.almacen,
      value: item.idalmacen,
    }))
    almacenSeleccionado.value = almacenes.value.length > 0 ? almacenes.value[0] : null
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los almacenes' })
  }
}

async function loadRows() {
  try {
    const response = await api.get(`listaCompra/${idempresa}`)
    compras.value = response.data
    console.log(response.data)
  } catch (error) {
    console.error('Error al cargar compras:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar las compras' })
  }
}

function toggleForm() {
  showForm.value = !showForm.value
  if (!showForm.value) {
    isEditing.value = false
    resetForm()
  }
}

async function verDetalle(compra) {
  try {
    await listaProductosDisponibles(compra)
    await getDetalleCompra(compra)
    mostrarDetalleCompra.value = true
    formularioDetalleCompra.value = {
      ...compra,
      autorizacion: compra.autorizacion,
      ver: 'registrarDetalleCompra',
      idingreso: compra.id,
      idalmacen: compra.idalmacen,
    }
    console.log(formularioDetalleCompra.value)
  } catch (error) {
    $q.notify({ type: 'negative', message: 'No se pudo mostrar el detalle de la compra' + error })
  }
}

async function listaProductosDisponibles(compra) {
  formularioDetalleCompra.value = {
    ver: 'registrarDetalleCompra',
    idingreso: compra.id,
  }
  try {
    const response = await api.get(`ListaProductosCompra/${compra.id}/${compra.idalmacen}`)
    productosDisponibles.value = response.data.map((item) => ({
      label: `${item.codigo} - ${item.descripcion}`,
      value: item.idproductoalmacen,
      stock: item.stock,
      descripcion: item.descripcion,
    }))
  } catch (error) {
    console.error('Error al cargar productos disponibles:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los productos' })
  }
}
//Hubo un problema al guardar el detalle

async function getDetalleCompra(compra) {
  try {
    const response = await api.get(`listaDetalleCompra/${compra.id}`)
    detalleCompra.value = response.data
  } catch (error) {
    console.error('Error al cargar detalles de compra:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los detalles de la compra' })
  }
}

function cancelarDetalle() {
  mostrarDetalleCompra.value = false
}

async function autorizarCompra(compra) {
  console.log(compra)
  $q.dialog({
    title: 'Confirmar',
    message: `¿Confirmar Compra?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const verificar = await api.get(`listaDetalleCompra/${compra.id}`)
      console.log(verificar.data)
      if (verificar.data.length > 0) {
        const point = `actualizarEstadoCompra/${compra.id}/1/${compra.idpedido}/${compra.idalmacen}`
        const response = await api.get(point)
        console.log(response)
        if (response.data.estado === 'error') {
          $q.notify({ type: 'negative', message: response.data.message })
        } else {
          $q.notify({ type: 'positive', message: response.data.message })

          iniciar()
        }
      } else {
        $q.notify({ type: 'negative', message: 'No se ingreso ningun producto' })
      }
    } catch (error) {
      console.error('Error al autorizar compra:', error)
      $q.notify({ type: 'negative', message: 'No se pudo autorizar la compra' })
    }
  })
}

function generarCodigo() {
  return `C-${compras.value.length}`
}
watch(
  () => compraStore.compraPendiente,
  (nueva) => {
    if (nueva) {
      console.log('Se registró nueva compra:', nueva)
      toggleForm()
      // aquí abres modal, reseteas formulario, etc.
    }
  },
  { immediate: true },
)
function handleKeydown(e) {
  if (e.key === 'Escape') {
    showForm.value = false
    mostrarDetalleCompra.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

async function iniciar() {
  await cargarAlmacenes()
  await cargarProveedores()
  await loadRows()
  registroActual.value = {
    ver: 'registrarCompra',
    idusuario: idusuario,
    factura: compras.value.length,
    codigo: generarCodigo(),
    nombre: 'CMP-',
    tipoRegistro: 2,
  }
}
onMounted(async () => {
  iniciar()
})
</script>
