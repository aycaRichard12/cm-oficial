<template>
  <q-page class="q-pa-md">
    <div class="titulo">Asignar Producto</div>
    <div class="row q-col-gutter-md">
      <!-- Main Content Area -->
      <div class="col-12">
        <!-- First View - Product List -->
        <div v-show="currentView === 'list'">
          <product-list
            :rows="productosFiltrados"
            :opciones="almacenes"
            @edit-item="handleEditar"
            @delete-item="handleEliminar"
            @add="handleAgregar"
            @onPrintReport="handleImprimir"
            @onSeleccion_almacen="handleSeleccionAlmacen"
          />
        </div>

        <!-- Second View - Available Products -->
        <div v-show="currentView === 'available'">
          <!-- <available-products @back="switchView('list')" @continue="switchView('details')" /> -->
          <available-products
            :rows="productoSA"
            :opciones="almacenes"
            @atras="irAtras"
            @continuar="irAdelante"
            @onSeleccion_almacen="almacenSeleccionadoAP"
            @productosSeleccionados="recibirSeleccionados"
          />
        </div>

        <!-- Third View - Product Details -->
        <div v-show="currentView === 'details'">
          <product-details-form @back="switchView('available')" @submit="saveProduct" />
        </div>
      </div>
    </div>

    <!-- Report Modal -->
    <q-dialog v-model="reportModal" full-width>
      <report-modal
        :report-data="reportData"
        @close="reportModal = false"
        @download="downloadPDF"
      />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import ProductList from 'components/producto/asignacion/ProductList.vue'
import AvailableProducts from 'components/producto/asignacion/AvailableProducts.vue'
import ProductDetailsForm from 'components/producto/asignacion/ProductDetailsForm.vue'
import ReportModal from 'components/producto/asignacion/ReportModal.vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { validarUsuario } from 'src/composables/FuncionesG'
const $q = useQuasar()
const contenidousuario = validarUsuario()
const idempresa = contenidousuario[0]?.empresa?.idempresa
const idusuario = contenidousuario[0]?.idusuario
// Datos completos desde una API o fuente local
const productos = ref([]) // todos los productos
const almacenes = ref([]) // lista de almacenes
const currentView = ref('list')
const almacenSeleccionado = ref(null)

const productosFiltrados = computed(() => {
  console.log(almacenSeleccionado.value)
  console.log(productos)
  if (!almacenSeleccionado.value) return []
  return productos.value.filter((p) => p.idalmacen == almacenSeleccionado.value)
})
const getAlmacenes = async () => {
  try {
    const response = await api.get(`listaResponsableAlmacen/${idempresa}`) // ejemplo
    console.log(response)
    const filtrado = response.data.filter((obj) => obj.idusuario == idusuario)
    const formateado = filtrado.map((item) => ({
      label: item.almacen,
      value: Number(item.idalmacen),
    }))

    almacenes.value = formateado
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
const getProductoAlmacen = async () => {
  try {
    const response = await api.get(`listaProductoAlmacen/${idempresa}`) // ejemplo
    console.log(response.data)
    productos.value = response.data
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
function handleEditar(item) {
  console.log('Editar:', item)
}
function handleEliminar(item) {
  console.log('Eliminar:', item.id)
  $q.dialog({
    title: 'Confirmar',
    message: `¿Eliminar Producto?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarProductoAlmacen/${item.id}/`) // Cambia a tu ruta real
      console.log(response)
      if (response.data.estado === 'exito') {
        getProductoAlmacen()

        $q.notify({
          type: 'positive',
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
function handleAgregar() {
  abrirModalAgregar('available')
}
function switchView(view) {
  currentView.value = view
}
function handleImprimir() {
  console.log('Imprimir reporte')
}
function abrirModalAgregar(view) {
  currentView.value = view
}
function handleSeleccionAlmacen(val) {
  console.log(val)
  almacenSeleccionado.value = val
}
//==================================================================================
const productoSA = ref([]) // todos los productos

const almacenSeleccionadoAP = async (almacenId) => {
  console.log('Almacén seleccionado:', almacenId)
  try {
    const response = await api.get(`listaProductoAlmacenFaltantes/${almacenId}/${idempresa}`) // ejemplo
    console.log(response.data)
    productoSA.value = response.data
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
const productoS = ref([])

const recibirSeleccionados = (productosSeleccionados) => {
  console.log('Productos seleccionados:', productosSeleccionados)
  // Guardar la lista en la variable reactiva
  productoS.value = productosSeleccionados
}

const irAtras = () => {
  currentView.value = 'list'
}

const irAdelante = () => {
  currentView.value = 'details'
  const productosPlanos = JSON.parse(JSON.stringify(productoS.value))
  console.log('Todos los productos seleccionados (valor plano):', productosPlanos)
}
//===============================
const saveProduct = async (formularioDetalles) => {
  currentView.value = 'details'
  const arrayJsonString = JSON.parse(JSON.stringify(productoS.value))
  console.log('Todos los productos seleccionados (valor plano):', arrayJsonString)
  const formData = new FormData()
  formData.append('jsonProductos', JSON.stringify(arrayJsonString))
  formData.append('ver', 'registrarProductoAlmacen')
  formData.append('detalle', formularioDetalles.detalle)
  formData.append('stockmin', formularioDetalles.stockmin)
  formData.append('stockmax', formularioDetalles.stockmax)
  try {
    const response = await api.post(``, formData)
    console.log(response)
    if (response.data.estado === 'exito') {
      $q.notify({ type: 'positive', message: response.data.estado.mensaje })
      currentView.value = 'list'
      getProductoAlmacen()
      productoS.value = []
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.estado.mensaje || 'Error al registrar productos',
      })
    }
  } catch (error) {
    console.error('Error al guardar:', error)
    console.error('Error al registrar productos:', error)
    $q.notify({ type: 'negative', message: 'Fallo al enviar los datos al servidor' })
  }
}
onMounted(() => {
  getAlmacenes()
  getProductoAlmacen()
})
</script>
